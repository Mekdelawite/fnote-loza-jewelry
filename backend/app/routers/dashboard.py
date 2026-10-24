import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.models import AdminUser, Product, Sale, SaleItem
from backend.app.auth import get_current_admin

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    active_products = db.query(Product).filter(Product.status != "archived").all()
    low_stock = [p for p in active_products if 0 < p.stock_quantity <= p.low_stock_threshold]
    out_of_stock = [p for p in active_products if p.stock_quantity == 0]

    completed_sales = db.query(Sale).filter(Sale.payment_status == "completed").all()

    now = datetime.datetime.utcnow()
    today_start = datetime.datetime(now.year, now.month, now.day)
    month_start = datetime.datetime(now.year, now.month, 1)

    today_sales = [s for s in completed_sales if s.created_at >= today_start]
    today_revenue = sum(s.total_amount for s in today_sales)

    month_sales = [s for s in completed_sales if s.created_at >= month_start]
    monthly_revenue = sum(s.total_amount for s in month_sales)

    total_revenue = sum(s.total_amount for s in completed_sales)
    total_cost = sum(s.total_cost for s in completed_sales)
    gross_profit = max(0.0, total_revenue - total_cost)

    inventory_value = sum(p.stock_quantity * p.selling_price for p in active_products)

    # Best sellers
    best_sellers_query = db.query(
        SaleItem.product_id,
        SaleItem.product_name_en,
        SaleItem.product_name_am,
        SaleItem.sku,
        func.sum(SaleItem.quantity).label("total_qty"),
        func.sum(SaleItem.subtotal).label("total_rev")
    ).join(Sale).filter(Sale.payment_status == "completed").group_by(
        SaleItem.product_id, SaleItem.product_name_en, SaleItem.product_name_am, SaleItem.sku
    ).order_by(func.sum(SaleItem.quantity).desc()).limit(5).all()

    best_sellers = [
        {
            "product_id": r[0],
            "product_name_en": r[1],
            "product_name_am": r[2],
            "sku": r[3],
            "total_quantity_sold": int(r[4]),
            "total_revenue": float(r[5])
        }
        for r in best_sellers_query
    ]

    recent_sales = db.query(Sale).order_by(Sale.created_at.desc()).limit(10).all()

    return {
        "today_sales_count": len(today_sales),
        "today_revenue": today_revenue,
        "monthly_revenue": monthly_revenue,
        "total_completed_sales": len(completed_sales),
        "estimated_gross_profit": gross_profit,
        "total_inventory_value": inventory_value,
        "low_stock_count": len(low_stock),
        "out_of_stock_count": len(out_of_stock),
        "active_product_count": len(active_products),
        "recent_sales": recent_sales,
        "low_stock_products": low_stock,
        "best_selling_products": best_sellers
    }
