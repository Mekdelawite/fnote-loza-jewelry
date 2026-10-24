import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="owner") # owner, manager
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(50), unique=True, index=True, nullable=False)
    name_en = Column(String(100), nullable=False)
    name_am = Column(String(100), nullable=False)
    description_en = Column(Text, nullable=True)
    description_am = Column(Text, nullable=True)

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name_en = Column(String(255), nullable=False, index=True)
    name_am = Column(String(255), nullable=False, index=True)
    description_en = Column(Text, nullable=False)
    description_am = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    material = Column(String(50), nullable=False, index=True) # gold, silver, mixed
    purity = Column(String(50), nullable=False) # 18K, 21K, 24K, 925_sterling
    weight_grams = Column(Float, nullable=True)
    dimensions = Column(String(100), nullable=True)
    purchase_cost = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    price_on_request = Column(Boolean, default=False)
    stock_quantity = Column(Integer, default=0, nullable=False)
    low_stock_threshold = Column(Integer, default=2, nullable=False)
    status = Column(String(50), default="available", index=True) # available, low_stock, out_of_stock, sold, archived
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    movements = relationship("InventoryMovement", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    alt_en = Column(String(255), nullable=True)
    alt_am = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)

    product = relationship("Product", back_populates="images")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sale_reference = Column(String(50), unique=True, index=True, nullable=False)
    total_amount = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    payment_method = Column(String(50), nullable=False) # cash, bank_transfer, cbe_birr, telebirr, card
    payment_status = Column(String(50), default="completed", index=True) # completed, reversed, pending
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    responsible_admin = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    reversed_at = Column(DateTime, nullable=True)
    reversal_reason = Column(Text, nullable=True)

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    sale_id = Column(String(36), ForeignKey("sales.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    sku = Column(String(50), nullable=False)
    product_name_en = Column(String(255), nullable=False)
    product_name_am = Column(String(255), nullable=False)
    unit_price = Column(Float, nullable=False)
    unit_cost = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    sale = relationship("Sale", back_populates="items")

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_id = Column(String(36), ForeignKey("products.id"), nullable=False)
    product_sku = Column(String(50), nullable=False)
    product_name = Column(String(255), nullable=False)
    change_quantity = Column(Integer, nullable=False)
    previous_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    movement_type = Column(String(50), nullable=False) # initial_stock, sale, restock, correction, damage, sale_reversal
    reference_id = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    admin_name = Column(String(255), nullable=False)

    product = relationship("Product", back_populates="movements")

class BrandSettingsModel(Base):
    __tablename__ = "brand_settings"

    id = Column(Integer, primary_key=True, default=1)
    brand_name_en = Column(String(100), default="Fnote Loza")
    brand_name_am = Column(String(100), default="ፍኖተ ሎዛ")
    tagline_en = Column(String(255), default="Crafted with Meaning. Made to Last.")
    tagline_am = Column(String(255), default="በጥበብ የተሠራ፣ ለዘላለም የሚቆይ።")
    founder_name_en = Column(String(255), default="Haile Meskel Aysheshem")
    founder_name_am = Column(String(255), default="ኃይለ መስቀል አይሸሸም")
    founder_title_en = Column(String(255), default="Founder of Fnote Loza")
    founder_title_am = Column(String(255), default="የፍኖተ ሎዛ መስራችና ባለቤት")
    founder_bio_en = Column(Text)
    founder_bio_am = Column(Text)
    founder_photo_url = Column(Text, default="")
    whatsapp_number = Column(String(50), default="+251911234567")
    phone_number = Column(String(50), default="+251 91 123 4567")
    address_en = Column(String(255))
    address_am = Column(String(255))
    gold_rate_21k_etb = Column(Float, default=11200.0)
