import datetime
import os
import secrets
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_TEST_STORAGE = tempfile.TemporaryDirectory(prefix="fnote-backend-tests-")
_TEST_DIRECTORY = Path(_TEST_STORAGE.name)
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DIRECTORY / 'startup.db'}"
os.environ["SECRET_KEY"] = secrets.token_urlsafe(48)
TEST_ADMIN_EMAIL = "test-admin@example.com"
TEST_ADMIN_PASSWORD = secrets.token_urlsafe(32)
os.environ["ADMIN_EMAIL"] = TEST_ADMIN_EMAIL
os.environ["ADMIN_PASSWORD"] = TEST_ADMIN_PASSWORD

from backend.app.auth import create_access_token, get_password_hash, pwd_context, verify_password
from backend.app.config import Settings, settings
from backend.app.database import Base, SessionLocal, engine as startup_engine, get_db
from backend.app.main import app, seed_initial_data
from backend.app.models import AdminUser, Product, ProductImage
from backend.app.schemas import ProductResponse

pwd_context.update(bcrypt__rounds=4)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{_TEST_DIRECTORY / 'api-tests.db'}"
test_engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    with TestingSessionLocal() as db:
        db.add(
            AdminUser(
                email=TEST_ADMIN_EMAIL,
                hashed_password=get_password_hash(TEST_ADMIN_PASSWORD),
                full_name="Test Administrator",
                role="owner",
                is_active=True,
            )
        )
        db.commit()
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    startup_engine.dispose()
    _TEST_STORAGE.cleanup()


@pytest.fixture
def admin_token():
    response = client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": TEST_ADMIN_PASSWORD},
    )
    assert response.status_code == 200
    assert set(response.json()) == {"access_token", "token_type", "email", "full_name", "role"}
    return response.json()["access_token"]


def auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_settings_load_dotenv_file(tmp_path):
    env_file = tmp_path / ".env"
    env_file.write_text(
        "DATABASE_URL=sqlite:///settings-test.db\n"
        "SECRET_KEY=0123456789abcdef0123456789abcdef\n"
        "ALGORITHM=HS384\n"
        "ACCESS_TOKEN_EXPIRE_MINUTES=25\n",
        encoding="utf-8",
    )

    configured = Settings(_env_file=env_file)

    assert configured.ALGORITHM == "HS384"
    assert configured.ACCESS_TOKEN_EXPIRE_MINUTES == 25


def test_settings_validate_admin_bootstrap_credentials():
    with pytest.raises(ValueError, match="must both be set"):
        Settings(
            _env_file=None,
            DATABASE_URL="sqlite:///settings-test.db",
            SECRET_KEY=secrets.token_urlsafe(48),
            ADMIN_EMAIL=TEST_ADMIN_EMAIL,
            ADMIN_PASSWORD=None,
        )

    with pytest.raises(ValueError, match="72 UTF-8 bytes"):
        Settings(
            _env_file=None,
            DATABASE_URL="sqlite:///settings-test.db",
            SECRET_KEY=secrets.token_urlsafe(48),
            ADMIN_EMAIL=TEST_ADMIN_EMAIL,
            ADMIN_PASSWORD="x" * 73,
        )


def test_password_hashing_and_bcrypt_length_validation():
    hashed = get_password_hash("supported password")

    assert verify_password("supported password", hashed)
    assert not verify_password("incorrect password", hashed)
    assert verify_password("x" * 72, get_password_hash("x" * 72))
    assert verify_password("é" * 36, get_password_hash("é" * 36))
    with pytest.raises(ValueError, match="72 UTF-8 bytes"):
        get_password_hash("x" * 73)
    with pytest.raises(ValueError, match="72 UTF-8 bytes"):
        verify_password("x" * 73, hashed)


def test_login_rejects_invalid_or_oversized_passwords():
    invalid = client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": "incorrect"},
    )
    oversized = client.post(
        "/api/auth/login",
        json={"email": TEST_ADMIN_EMAIL, "password": "x" * 73},
    )

    assert invalid.status_code == 401
    assert oversized.status_code == 422
    assert "72 UTF-8 bytes" in oversized.text


def test_login_does_not_create_unknown_administrator():
    email = "unseeded-user@example.com"
    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": TEST_ADMIN_PASSWORD},
    )

    assert response.status_code == 401
    with TestingSessionLocal() as db:
        assert db.query(AdminUser).filter(AdminUser.email == email).count() == 0


def test_auth_token_endpoint_preserves_oauth_password_flow():
    response = client.post(
        "/api/auth/token",
        data={"username": TEST_ADMIN_EMAIL, "password": TEST_ADMIN_PASSWORD},
    )

    assert response.status_code == 200
    assert response.json()["token_type"] == "bearer"
    assert response.json()["email"] == TEST_ADMIN_EMAIL


def test_missing_invalid_expired_and_valid_admin_tokens(admin_token):
    protected_path = "/api/dashboard/summary"

    assert client.get(protected_path).status_code == 401
    assert client.get(protected_path, headers=auth_headers("malformed")).status_code == 401
    invalid_signature = f"{admin_token[:-1]}{'A' if admin_token[-1] != 'A' else 'B'}"
    assert client.get(protected_path, headers=auth_headers(invalid_signature)).status_code == 401

    missing_exp_token = jwt.encode(
        {"sub": TEST_ADMIN_EMAIL},
        settings.SECRET_KEY.get_secret_value(),
        algorithm=settings.ALGORITHM,
    )
    assert client.get(protected_path, headers=auth_headers(missing_exp_token)).status_code == 401

    expired_token = create_access_token(
        {"sub": TEST_ADMIN_EMAIL},
        expires_delta=datetime.timedelta(seconds=-1),
    )
    assert client.get(protected_path, headers=auth_headers(expired_token)).status_code == 401
    assert client.get(protected_path, headers=auth_headers(admin_token)).status_code == 200


def test_auth_me_requires_and_returns_authenticated_admin(admin_token):
    assert client.get("/api/auth/me").status_code == 401

    response = client.get("/api/auth/me", headers=auth_headers(admin_token))

    assert response.status_code == 200
    assert set(response.json()) == {"id", "email", "full_name", "role"}
    assert response.json()["email"] == TEST_ADMIN_EMAIL
    assert response.json()["full_name"] == "Test Administrator"
    assert response.json()["role"] == "owner"


def test_admin_data_requires_auth_but_catalog_remains_public(admin_token):
    protected_paths = (
        "/api/sales",
        "/api/inventory/movements",
        "/api/dashboard/summary",
    )
    for path in protected_paths:
        assert client.get(path).status_code == 401
        assert client.get(path, headers=auth_headers(admin_token)).status_code == 200

    assert client.get("/api/products").status_code == 200
    assert client.get("/api/brand/settings").status_code == 200


def test_authenticated_non_admin_cannot_access_admin_endpoint():
    non_admin_email = "staff-user@example.com"
    non_admin = AdminUser(
        email=non_admin_email,
        hashed_password=get_password_hash(secrets.token_urlsafe(24)),
        full_name="Non Admin User",
        role="customer",
        is_active=True,
    )
    non_admin_role = non_admin.role
    with TestingSessionLocal() as db:
        db.add(non_admin)
        db.commit()

    token = create_access_token({"sub": non_admin_email, "role": non_admin_role})
    response = client.get("/api/dashboard/summary", headers=auth_headers(token))

    assert response.status_code == 403


def test_seed_is_idempotent_and_preserves_existing_admin_password():
    with SessionLocal() as db:
        admin = db.query(AdminUser).filter(AdminUser.email == TEST_ADMIN_EMAIL).one()
        existing_hash = get_password_hash("existing database password")
        admin.hashed_password = existing_hash
        product = db.query(Product).filter_by(sku="FNL-GD-001").one()
        db.query(ProductImage).filter_by(product_id=product.id).delete()
        db.commit()

    seed_initial_data()
    seed_initial_data()

    with SessionLocal() as db:
        admins = db.query(AdminUser).filter(AdminUser.email == TEST_ADMIN_EMAIL).all()
        assert len(admins) == 1
        assert admins[0].hashed_password == existing_hash
        assert verify_password("existing database password", admins[0].hashed_password)
        assert not verify_password(TEST_ADMIN_PASSWORD, admins[0].hashed_password)
        products = {product.sku: product for product in db.query(Product).all()}
        expected_image_urls = {
            "FNL-GD-001": "/src/assets/images/product_gold_necklace_1792823131025.jpg",
            "FNL-SV-002": "/src/assets/images/product_silver_cuff_1792823130893.jpg",
            "FNL-WD-003": "/src/assets/images/product_wedding_rings_1792823132120.jpg",
        }
        for sku, image_url in expected_image_urls.items():
            assert [image.url for image in products[sku].images] == [image_url]
            assert ProductResponse.model_validate(products[sku]).images[0].url == image_url


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_and_sell_product(admin_token):
    headers = auth_headers(admin_token)
    assert client.post(
        "/api/products",
        json={"sku": "UNAUTHORIZED-PRODUCT"},
    ).status_code == 401

    new_prod = {
        "sku": "TEST-GD-999",
        "name_en": "Test Filigree Ring",
        "name_am": "የሙከራ ቀለበት",
        "description_en": "Handcrafted ring",
        "description_am": "በእጅ የተሰራ",
        "category": "rings",
        "material": "gold",
        "purity": "21K",
        "weight_grams": 8.5,
        "purchase_cost": 50000.0,
        "selling_price": 65000.0,
        "stock_quantity": 5,
        "low_stock_threshold": 2,
        "price_on_request": False,
        "is_featured": True,
        "images": [
            {
                "id": "frontend-generated-image-id",
                "url": "/src/assets/images/product_gold_necklace_1792823131025.jpg",
                "alt_en": "Test Filigree Ring",
                "alt_am": "የሙከራ ቀለበት",
                "is_primary": True,
            }
        ],
    }
    create_res = client.post("/api/products", json=new_prod, headers=headers)
    assert create_res.status_code == 201
    prod_data = create_res.json()
    assert len(prod_data["images"]) == 1
    assert prod_data["images"][0]["alt_en"] == "Test Filigree Ring"
    prod_id = prod_data["id"]

    sale_payload = {
        "items": [{"product_id": prod_id, "quantity": 2, "unit_price": 65000.0}],
        "payment_method": "cash",
        "customer_name": "Test Client",
    }
    sale_res = client.post("/api/sales", json=sale_payload, headers=headers)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()
    assert sale_data["total_amount"] == 130000.0
    sale_id = sale_data["id"]

    get_res = client.get(f"/api/products/{prod_id}")
    assert get_res.json()["stock_quantity"] == 3

    rev_res = client.post(
        f"/api/sales/{sale_id}/reverse",
        json={"reason": "Customer sizing adjustment"},
        headers=headers,
    )
    assert rev_res.status_code == 200
    assert rev_res.json()["payment_status"] == "reversed"

    get_restored = client.get(f"/api/products/{prod_id}")
    assert get_restored.json()["stock_quantity"] == 5
