from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, UserProfile, NutritionTarget, BodyMeasurement
from app.schemas.schemas import (
    UserProfileOut, UserProfileUpdate,
    NutritionTargetOut, BodyMeasurementCreate, BodyMeasurementOut
)
from app.services.nutrition_engine import NutritionEngine

router = APIRouter(prefix="/profile", tags=["User Profile"])

@router.get("", response_model=UserProfileOut)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=UserProfileOut)
def update_profile(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    # Automatically recompute targets and record weight if weight provided
    if profile.current_weight_kg and profile.height_cm and profile.age:
        recalculate_and_save_targets(current_user.id, profile, db)
        # Record latest measurement
        measurement = BodyMeasurement(
            user_id=current_user.id,
            date=date.today(),
            weight_kg=profile.current_weight_kg,
            bmi=NutritionEngine.calculate_bmi(profile.current_weight_kg, profile.height_cm)["bmi"]
        )
        db.add(measurement)
        db.commit()

    return profile

@router.get("/targets", response_model=NutritionTargetOut)
def get_targets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target = db.query(NutritionTarget).filter(NutritionTarget.user_id == current_user.id).first()
    if not target:
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        target = recalculate_and_save_targets(current_user.id, profile, db)
    return target

@router.post("/recalculate-targets", response_model=NutritionTargetOut)
def recalculate_targets_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return recalculate_and_save_targets(current_user.id, profile, db)

@router.post("/measurements", response_model=BodyMeasurementOut)
def add_measurement(
    m_in: BodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    bmi = None
    if profile and profile.height_cm:
        bmi = NutritionEngine.calculate_bmi(m_in.weight_kg, profile.height_cm)["bmi"]

    meas = BodyMeasurement(
        user_id=current_user.id,
        date=m_in.date or date.today(),
        weight_kg=m_in.weight_kg,
        waist_cm=m_in.waist_cm,
        body_fat_pct=m_in.body_fat_pct,
        bmi=bmi,
        notes=m_in.notes
    )
    db.add(meas)
    
    # Update current weight on profile
    if profile:
        profile.current_weight_kg = m_in.weight_kg
        recalculate_and_save_targets(current_user.id, profile, db)

    db.commit()
    db.refresh(meas)
    return meas

@router.get("/measurements", response_model=List[BodyMeasurementOut])
def get_measurements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.date.desc()).limit(60).all()

def recalculate_and_save_targets(user_id: int, profile: UserProfile, db: Session) -> NutritionTarget:
    weight = profile.current_weight_kg if (profile and profile.current_weight_kg) else 70.0
    height = profile.height_cm if (profile and profile.height_cm) else 170.0
    age = profile.age if (profile and profile.age) else 28
    sex = profile.sex if (profile and profile.sex) else "male"
    act = profile.activity_level if (profile and profile.activity_level) else "moderate"
    goal = profile.goal if (profile and profile.goal) else "maintain"
    rate = profile.preferred_rate if (profile and profile.preferred_rate) else 0.5

    calculated = NutritionEngine.calculate_targets(
        weight_kg=weight,
        height_cm=height,
        age=age,
        sex=sex,
        activity_level=act,
        goal=goal,
        preferred_rate=rate
    )

    target = db.query(NutritionTarget).filter(NutritionTarget.user_id == user_id).first()
    if not target:
        target = NutritionTarget(user_id=user_id, **calculated)
        db.add(target)
    else:
        for k, v in calculated.items():
            setattr(target, k, v)

    db.commit()
    db.refresh(target)
    return target
