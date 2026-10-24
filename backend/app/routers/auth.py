from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.auth import create_access_token, verify_password
from backend.app.database import get_db
from backend.app.models import AdminUser
from backend.app.schemas import LoginRequest, Token
from backend.app.auth import get_current_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/me")
def get_authenticated_admin(admin: AdminUser = Depends(get_current_admin)):
    return {
        "id": admin.id,
        "email": admin.email,
        "full_name": admin.full_name,
        "role": admin.role,
    }


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.email == login_data.email).first()
    if (
        admin is None
        or not admin.is_active
        or not verify_password(login_data.password, admin.hashed_password)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(data={"sub": admin.email, "role": admin.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": admin.email,
        "full_name": admin.full_name,
        "role": admin.role,
    }


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return login(LoginRequest(email=form_data.username, password=form_data.password), db)
