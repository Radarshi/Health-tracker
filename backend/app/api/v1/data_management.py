from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import (
    User, UserProfile, NutritionTarget, BodyMeasurement,
    Meal, MealItem, Recipe, HydrationEntry, NotificationPreference
)
from app.schemas.schemas import NotificationPrefUpdate, NotificationPrefOut

router = APIRouter(tags=["Data Management & Settings"])

@router.get("/export")
def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    targets = db.query(NutritionTarget).filter(NutritionTarget.user_id == current_user.id).first()
    measurements = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == current_user.id).all()
    meals = db.query(Meal).filter(Meal.user_id == current_user.id).all()
    recipes = db.query(Recipe).filter(Recipe.user_id == current_user.id).all()
    hydration = db.query(HydrationEntry).filter(HydrationEntry.user_id == current_user.id).all()

    return {
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        "profile": {
            "age": profile.age if profile else None,
            "sex": profile.sex if profile else None,
            "height_cm": profile.height_cm if profile else None,
            "current_weight_kg": profile.current_weight_kg if profile else None,
            "target_weight_kg": profile.target_weight_kg if profile else None,
            "activity_level": profile.activity_level if profile else None,
            "goal": profile.goal if profile else None
        } if profile else None,
        "targets": {
            "calorie_target": targets.daily_calorie_target if targets else None,
            "protein_g": targets.protein_g if targets else None,
            "carbs_g": targets.carbs_g if targets else None,
            "fat_g": targets.fat_g if targets else None,
            "hydration_ml": targets.hydration_ml if targets else None
        } if targets else None,
        "measurements_count": len(measurements),
        "meals_count": len(meals),
        "recipes_count": len(recipes),
        "hydration_entries_count": len(hydration),
        "exported_at": current_user.updated_at.isoformat() if current_user.updated_at else None
    }

@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.delete(current_user)
    db.commit()
    return {"message": "Account and all associated personal data have been permanently deleted."}

@router.get("/notifications/preferences", response_model=NotificationPrefOut)
def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/notifications/preferences", response_model=NotificationPrefOut)
def update_notification_preferences(
    pref_in: NotificationPrefUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).first()
    if not pref:
        pref = NotificationPreference(user_id=current_user.id)
        db.add(pref)

    for field, val in pref_in.model_dump(exclude_unset=True).items():
        setattr(pref, field, val)

    db.commit()
    db.refresh(pref)
    return pref
