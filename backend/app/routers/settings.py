from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import BrandSettingsModel, AdminUser
from backend.app.schemas import BrandSettingsSchema
from backend.app.auth import get_current_admin

router = APIRouter(prefix="/brand", tags=["brand"])

@router.get("/settings", response_model=BrandSettingsSchema)
def get_brand_settings(db: Session = Depends(get_db)):
    settings_obj = db.query(BrandSettingsModel).filter(BrandSettingsModel.id == 1).first()
    if not settings_obj:
        settings_obj = BrandSettingsModel(
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
        db.add(settings_obj)
        db.commit()
        db.refresh(settings_obj)
    return settings_obj

@router.post("/settings", response_model=BrandSettingsSchema)
def update_brand_settings(
    settings_in: BrandSettingsSchema,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin)
):
    settings_obj = db.query(BrandSettingsModel).filter(BrandSettingsModel.id == 1).first()
    if not settings_obj:
        settings_obj = BrandSettingsModel(id=1)
        db.add(settings_obj)

    for field, val in settings_in.dict().items():
        setattr(settings_obj, field, val)

    db.commit()
    db.refresh(settings_obj)
    return settings_obj
