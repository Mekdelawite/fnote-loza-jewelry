import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import Product, Sale, SaleItem, InventoryMovement, AdminUser
from backend.app.schemas import SaleCreate, SaleResponse, SaleReverseRequest
from backend.app.auth import get_current_admin

router = APIRouter(prefix="/sales", tags=["sales"])

@router.get("", response_model=List[SaleResponse])
def get_sales(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    return db.query(Sale).order_by(Sale.created_at.desc()).all()

@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def record_sale(
    sale_in: SaleCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    if not sale_in.items:
        raise HTTPException(status_code=400, detail="Sale must contain at least one item")

    # Generate reference FNL-YYYY-XXXX
    count = db.query(Sale).count()
    year = datetime.datetime.utcnow().year
    sale_ref = f"FNL-{year}-{str(count + 43).padStart(4, '0') if hasattr(str, 'padStart') else str(count + 43).zfill(4)}"

    total_amount = 0.0
    total_cost = 0.0
    created_items = []

    try:
        # Atomic transaction: acquire lock on each product
        for item_in in sale_in.items:
            prod = db.query(Product).filter(Product.id == item_in.product_id).with_for_update().first()
            if not prod:
                raise HTTPException(status_code=404, detail=f"Product {item_in.product_id} not found")

            if prod.stock_quantity < item_in.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for '{prod.name_en}'. Available: {prod.stock_quantity}, requested: {item_in.quantity}"
                )

            subtotal = item_in.quantity * item_in.unit_price
            cost_subtotal = item_in.quantity * prod.purchase_cost
            total_amount += subtotal
            total_cost += cost_subtotal

            # Deduct stock
            prev_qty = prod.stock_quantity
            prod.stock_quantity -= item_in.quantity
            if prod.stock_quantity == 0:
                prod.status = "out_of_stock"
            elif prod.stock_quantity <= prod.low_stock_threshold:
                prod.status = "low_stock"

            # Create inventory movement record
            mov = InventoryMovement(
                product_id=prod.id,
                product_sku=prod.sku,
                product_name=prod.name_en,
                change_quantity=-item_in.quantity,
                previous_quantity=prev_qty,
                new_quantity=prod.stock_quantity,
                movement_type="sale",
                reference_id=sale_ref,
                reason=f"Sale {sale_ref}",
                admin_name=admin.full_name
            )
            db.add(mov)

            created_items.append({
                "product_id": prod.id,
                "sku": prod.sku,
                "product_name_en": prod.name_en,
                "product_name_am": prod.name_am,
                "unit_price": item_in.unit_price,
                "unit_cost": prod.purchase_cost,
                "quantity": item_in.quantity,
                "subtotal": subtotal
            })

        net_total = max(0.0, total_amount - (sale_in.discount or 0.0))

        sale = Sale(
            sale_reference=sale_ref,
            total_amount=net_total,
            total_cost=total_cost,
            discount=sale_in.discount or 0.0,
            payment_method=sale_in.payment_method,
            payment_status="completed",
            customer_name=sale_in.customer_name,
            customer_phone=sale_in.customer_phone,
            notes=sale_in.notes,
            responsible_admin=admin.full_name
        )
        db.add(sale)
        db.flush()

        for it in created_items:
            db.add(SaleItem(sale_id=sale.id, **it))

        db.commit()
        db.refresh(sale)
        return sale
    except Exception as e:
        db.rollback()
        raise e

@router.post("/{sale_id}/reverse", response_model=SaleResponse)
def reverse_sale(
    sale_id: str,
    rev_in: SaleReverseRequest,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.payment_status == "reversed":
        raise HTTPException(status_code=400, detail="This sale is already reversed")

    try:
        # Restore stock for each item
        for it in sale.items:
            prod = db.query(Product).filter(Product.id == it.product_id).with_for_update().first()
            if prod:
                prev_qty = prod.stock_quantity
                prod.stock_quantity += it.quantity
                if prod.stock_quantity > prod.low_stock_threshold:
                    prod.status = "available"
                elif prod.stock_quantity > 0:
                    prod.status = "low_stock"

                mov = InventoryMovement(
                    product_id=prod.id,
                    product_sku=prod.sku,
                    product_name=prod.name_en,
                    change_quantity=it.quantity,
                    previous_quantity=prev_qty,
                    new_quantity=prod.stock_quantity,
                    movement_type="sale_reversal",
                    reference_id=sale.sale_reference,
                    reason=f"Sale Reversal: {rev_in.reason}",
                    admin_name=admin.full_name
                )
                db.add(mov)

        sale.payment_status = "reversed"
        sale.reversed_at = datetime.datetime.utcnow()
        sale.reversal_reason = rev_in.reason

        db.commit()
        db.refresh(sale)
        return sale
    except Exception as e:
        db.rollback()
        raise e
