import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import AdminUser, Product, ProductImage, BrandSettingsModel
from backend.app.auth import get_password_hash
from backend.app.routers import products, sales, inventory, dashboard, settings as settings_router, auth

logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production REST API for Fnote Loza — Luxury Ethiopian Gold & Silver Jewelry Brand"
)

# CORS Middleware
origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed initial database records if empty
def seed_initial_data():
    db = SessionLocal()
    try:
        # Seed one administrator only when credentials are configured and none exists.
        if (
            settings.ADMIN_EMAIL
            and settings.ADMIN_PASSWORD
            and db.query(AdminUser).count() == 0
        ):
            db.add(
                AdminUser(
                    email=settings.ADMIN_EMAIL,
                    hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                    full_name="Haile Meskel Aysheshem",
                    role="owner",
                    is_active=True,
                )
            )

        # 2. Brand Settings
        brand = db.query(BrandSettingsModel).first()
        if not brand:
            brand = BrandSettingsModel(
                id=1,
                brand_name_en="Fnote Loza",
                brand_name_am="ፍኖተ ሎዛ",
                tagline_en="Crafted with Meaning. Made to Last.",
                tagline_am="በጥበብ የተሠራ፣ ለዘላለም የሚቆይ።",
                founder_name_en="Haile Meskel Aysheshem",
                founder_name_am="ኃይለ መስቀል አይሸሸም",
                founder_title_en="Founder of Fnote Loza",
                founder_title_am="የፍኖተ ሎዛ መስራችና ባለቤት",
                founder_bio_en="Under Haile Meskel Aysheshem's discerning vision, Fnote Loza bridges time-honored Ethiopian goldsmithing with contemporary luxury. Each piece is forged with genuine 21K gold and certified silver, shaped by human touch and crafted to be cherished across generations.",
                founder_bio_am="በኃይለ መስቀል አይሸሸም ጥበባዊ አመራር፣ ፍኖተ ሎዛ የኢትዮጵያን የጥንት የወርቅ አንጥረኝነት ጥበብ ከዘመናዊ ውበት ጋር ያዋህዳል። እያንዳንዱ ጌጣጌጥ በ21 ካራት ወርቅ እና በተረጋገጠ ንጹህ ብር በእጅ ተሰርቶ ከትውልድ ወደ ትውልድ የሚተላለፍ ቅርስ ነው።",
                founder_photo_url="",
                whatsapp_number="+251911234567",
                phone_number="+251 91 123 4567",
                address_en="Bole District, Behind Edna Mall, Addis Ababa, Ethiopia",
                address_am="ቦሌ ክፍለ ከተማ፣ ከኤድና ሞል ጀርባ፣ አዲስ አበባ፣ ኢትዮጵያ",
                gold_rate_21k_etb=11200.0
            )
            db.add(brand)

        # 3. Initial Products
        if db.query(Product).count() == 0:
            initial_prods = [
                Product(
                    id="prod-1",
                    sku="FNL-GD-001",
                    name_en="Lalibela 21K Gold Filigree Cross",
                    name_am="የላሊበላ 21 ካራት የወርቅ ጥልፍ መስቀል",
                    description_en="A magnificent handcrafted 21K yellow gold pendant featuring intricate geometric Ethiopian filigree motifs, polished edges, and balanced celestial symmetry.",
                    description_am="በ21 ካራት ንጹህ ቢጫ ወርቅ በእጅ የተሰራ ድንቅ የላሊበላ መስቀል ሀብል። የጥንታዊ ጥልፍ ጥበብና ዘመናዊ ንጽህና የተዋሃደበት።",
                    category="necklaces",
                    material="gold",
                    purity="21K",
                    weight_grams=14.8,
                    dimensions="48mm x 38mm with 50cm chain",
                    purchase_cost=135000.0,
                    selling_price=165000.0,
                    stock_quantity=3,
                    low_stock_threshold=2,
                    status="available",
                    is_featured=True
                ),
                Product(
                    id="prod-2",
                    sku="FNL-SV-002",
                    name_en="Axumite Hammered 925 Silver Cuff",
                    name_am="የአክሱም ቅርጽ 925 ንጹህ የብር አምባር",
                    description_en="Substantial 925 solid sterling silver cuff bracelet with hand-hammered texture and geometric chevron engraving inspired by ancient Axumite stele geometry.",
                    description_am="በጠንካራ 925 ንጹህ ብር የተሰራ፣ በአክሱም ሐውልት ቅርጽ የተዋበና በመዶሻ ተቀርጾ የተዘጋጀ የክብር አምባር።",
                    category="bracelets",
                    material="silver",
                    purity="925_sterling",
                    weight_grams=38.2,
                    dimensions="64mm inner diameter (adjustable)",
                    purchase_cost=16000.0,
                    selling_price=24500.0,
                    stock_quantity=6,
                    low_stock_threshold=2,
                    status="available",
                    is_featured=True
                ),
                Product(
                    id="prod-3",
                    sku="FNL-WD-003",
                    name_en="Eternal Harmony 21K Wedding Bands",
                    name_am="የዘላለም ቃልኪዳን 21 ካራት የሠርግ ቀለበቶች",
                    description_en="Pair of masterfully forged 21K gold bridal rings. The groom's band features a subtle brushed silk texture while the bride's is accented with channel-set brilliant stones.",
                    description_am="የተጣመሩ የሙሽራና ሙሽሪት የ21 ካራት ወርቅ የቃልኪዳን ቀለበቶች። የሙሽራው በልዩ የሐር ስሪት የተሰራ፣ የሙሽሪቷ በደመቁ እንቁዎች ያሸበረቀ።",
                    category="wedding",
                    material="gold",
                    purity="21K",
                    weight_grams=12.4,
                    dimensions="Sizes 7 & 10 (Custom sizing available)",
                    purchase_cost=115000.0,
                    selling_price=142000.0,
                    stock_quantity=4,
                    low_stock_threshold=2,
                    status="available",
                    is_featured=True
                )
            ]
            for p in initial_prods:
                db.add(p)

        db.commit()
    except Exception as exc:
        db.rollback()
        logger.error("Initial database seeding failed (%s)", type(exc).__name__)
        raise
    finally:
        db.close()

seed_initial_data()

# Register Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(sales.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(settings_router.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Fnote Loza Jewelry API",
        "founder": "Haile Meskel Aysheshem",
        "version": settings.VERSION
    }
