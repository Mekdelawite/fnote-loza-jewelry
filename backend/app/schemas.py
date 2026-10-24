import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

class ProductImageBase(BaseModel):
    url: str
    alt_en: Optional[str] = None
    alt_am: Optional[str] = None
    is_primary: bool = False

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageResponse(ProductImageBase):
    id: str
    product_id: str

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    sku: str
    name_en: str
    name_am: str
    description_en: str
    description_am: str
    category: str
    material: str
    purity: str
    weight_grams: Optional[float] = None
    dimensions: Optional[str] = None
    purchase_cost: float = Field(..., ge=0)
    selling_price: float = Field(..., ge=0)
    price_on_request: bool = False
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=2, ge=0)
    status: str = "available"
    is_featured: bool = False

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageCreate]] = []

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name_en: Optional[str] = None
    name_am: Optional[str] = None
    description_en: Optional[str] = None
    description_am: Optional[str] = None
    category: Optional[str] = None
    material: Optional[str] = None
    purity: Optional[str] = None
    weight_grams: Optional[float] = None
    dimensions: Optional[str] = None
    purchase_cost: Optional[float] = None
    selling_price: Optional[float] = None
    price_on_request: Optional[bool] = None
    stock_quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    images: Optional[List[ProductImageCreate]] = None

class ProductResponse(ProductBase):
    id: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    images: List[ProductImageResponse] = []

    class Config:
        from_attributes = True

# Stock Adjustment
class StockAdjustmentRequest(BaseModel):
    change: int
    movement_type: str = "restock" # restock, correction, damage, return
    reason: str

# Sales
class SaleItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)

class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
    payment_method: str = "cash"
    discount: float = 0.0
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None

class SaleItemResponse(BaseModel):
    id: str
    product_id: str
    sku: str
    product_name_en: str
    product_name_am: str
    unit_price: float
    unit_cost: float
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    id: str
    sale_reference: str
    total_amount: float
    total_cost: float
    discount: float
    payment_method: str
    payment_status: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    notes: Optional[str] = None
    responsible_admin: str
    created_at: datetime.datetime
    reversed_at: Optional[datetime.datetime] = None
    reversal_reason: Optional[str] = None
    items: List[SaleItemResponse] = []

    class Config:
        from_attributes = True

class SaleReverseRequest(BaseModel):
    reason: str

# Inventory Movements
class InventoryMovementResponse(BaseModel):
    id: str
    product_id: str
    product_sku: str
    product_name: str
    change_quantity: int
    previous_quantity: int
    new_quantity: int
    movement_type: str
    reference_id: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime.datetime
    admin_name: str

    class Config:
        from_attributes = True

# Brand Settings
class BrandSettingsSchema(BaseModel):
    brand_name_en: str
    brand_name_am: str
    tagline_en: str
    tagline_am: str
    founder_name_en: str
    founder_name_am: str
    founder_title_en: str
    founder_title_am: str
    founder_bio_en: str
    founder_bio_am: str
    founder_photo_url: str
    whatsapp_number: str
    phone_number: str
    address_en: str
    address_am: str
    gold_rate_21k_etb: Optional[float] = 11200.0

    class Config:
        from_attributes = True

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str
    email: str
    full_name: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

    @field_validator("password")
    @classmethod
    def validate_bcrypt_password_length(cls, password: str) -> str:
        if len(password.encode("utf-8")) > 72:
            raise ValueError("Password must not exceed 72 UTF-8 bytes")
        return password
