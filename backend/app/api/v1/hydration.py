from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, HydrationEntry
from app.schemas.schemas import HydrationCreate, HydrationOut

router = APIRouter(prefix="/hydration", tags=["Hydration Tracking"])

@router.post("", response_model=HydrationOut)
def log_water(
    h_in: HydrationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = HydrationEntry(
        user_id=current_user.id,
        amount_ml=h_in.amount_ml,
        date=h_in.date or date.today()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("", response_model=List[HydrationOut])
def get_hydration_entries(
    entry_date: date = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = entry_date or date.today()
    return db.query(HydrationEntry).filter(
        HydrationEntry.user_id == current_user.id,
        HydrationEntry.date == target_date
    ).all()

@router.delete("/{entry_id}")
def delete_hydration_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(HydrationEntry).filter(
        HydrationEntry.id == entry_id,
        HydrationEntry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Hydration entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Hydration entry deleted", "entry_id": entry_id}
