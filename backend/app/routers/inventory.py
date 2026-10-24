from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import AdminUser, InventoryMovement
from backend.app.schemas import InventoryMovementResponse
from backend.app.auth import get_current_admin

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/movements", response_model=List[InventoryMovementResponse])
def get_inventory_movements(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
):
    return db.query(InventoryMovement).order_by(InventoryMovement.created_at.desc()).limit(100).all()
