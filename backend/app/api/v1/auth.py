from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.all_models import User, UserProfile, NutritionTarget, NotificationPreference
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Create user
    user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name or user_in.email.split("@")[0].title()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default profile, targets, and notifications
    profile = UserProfile(
        user_id=user.id,
        age=28,
        sex="male",
        height_cm=175.0,
        current_weight_kg=72.0,
        target_weight_kg=68.0,
        activity_level="moderate",
        goal="lose_weight",
        preferred_rate=0.5
    )
    db.add(profile)

    target = NutritionTarget(
        user_id=user.id,
        bmr=1680.0,
        tdee=2400.0,
        daily_calorie_target=1950.0,
        protein_g=140.0,
        carbs_g=210.0,
        fat_g=60.0,
        fiber_g=28.0,
        hydration_ml=2500.0
    )
    db.add(target)

    pref = NotificationPreference(user_id=user.id)
    db.add(pref)
    db.commit()

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    token = create_access_token(user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        }
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
