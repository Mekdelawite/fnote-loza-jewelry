from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Product, ProductImage, InventoryMovement, AdminUser
from backend.app.schemas import ProductCreate, ProductUpdate, ProductResponse, StockAdjustmentRequest
from backend.app.auth import get_current_admin

router = APIRouter(prefix="/products", tags=["products"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = None,
    material: Optional[str] = None,
    available_only: bool = False,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if available_only:
        query = query.filter(Product.status.in_(["available", "low_stock"]))
    if category and category != "all":
        query = query.filter(Product.category == category)
    if material:
        query = query.filter(Product.material == material)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Product.name_en.ilike(s)) | 
            (Product.name_am.ilike(s)) | 
            (Product.sku.ilike(s)) | 
            (Product.description_en.ilike(s))
        )
    return query.order_by(Product.is_featured.desc(), Product.created_at.desc()).all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate, 
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    # Check duplicate SKU
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="A product with this SKU already exists")

    product_data = product_in.dict(exclude={"images"})
    product = Product(**product_data)
    db.add(product)
    db.flush()

    if product_in.images:
        for img in product_in.images:
            image_obj = ProductImage(product_id=product.id, **img.dict())
            db.add(image_obj)

    # Initial inventory movement
    movement = InventoryMovement(
        product_id=product.id,
        product_sku=product.sku,
        product_name=product.name_en,
        change_quantity=product.stock_quantity,
        previous_quantity=0,
        new_quantity=product.stock_quantity,
        movement_type="initial_stock",
        reason="Initial product creation",
        admin_name=admin.full_name
    )
    db.add(movement)

    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = product_in.dict(exclude_unset=True, exclude={"images"})
    for field, value in update_data.items():
        setattr(prod, field, value)

    if product_in.images is not None:
        db.query(ProductImage).filter(ProductImage.product_id == prod.id).delete()
        for img in product_in.images:
            db.add(ProductImage(product_id=prod.id, **img.dict()))

    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    prod.status = "archived"
    db.commit()
    return {"message": "Product archived successfully"}

@router.post("/{product_id}/stock", response_model=ProductResponse)
def adjust_stock(
    product_id: str,
    adj: StockAdjustmentRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    prod = db.query(Product).filter(Product.id == product_id).with_for_update().first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")

    prev_qty = prod.stock_quantity
    new_qty = max(0, prev_qty + adj.change)
    prod.stock_quantity = new_qty

    if new_qty == 0:
        prod.status = "out_of_stock"
    elif new_qty <= prod.low_stock_threshold:
        prod.status = "low_stock"
    else:
        prod.status = "available"

    movement = InventoryMovement(
        product_id=prod.id,
        product_sku=prod.sku,
        product_name=prod.name_en,
        change_quantity=adj.change,
        previous_quantity=prev_qty,
        new_quantity=new_qty,
        movement_type=adj.movement_type,
        reason=adj.reason,
        admin_name=admin.full_name
    )
    db.add(movement)
    db.commit()
    db.refresh(prod)
    return prod
