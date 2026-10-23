from datetime import datetime, date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Profile & Targets -----------------
class UserProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=120)
    sex: Optional[str] = "male"
    height_cm: Optional[float] = Field(None, gt=50, lt=260)
    current_weight_kg: Optional[float] = Field(None, gt=20, lt=350)
    target_weight_kg: Optional[float] = None
    activity_level: Optional[str] = "moderate"
    goal: Optional[str] = "maintain"
    preferred_rate: Optional[float] = 0.5
    dietary_preferences: Optional[str] = "none"
    allergies: Optional[str] = None
    health_notes: Optional[str] = None
    preferred_units: Optional[str] = "metric"

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileOut(UserProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NutritionTargetOut(BaseModel):
    id: int
    user_id: int
    bmr: float
    tdee: float
    daily_calorie_target: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    hydration_ml: float

    class Config:
        from_attributes = True

class BodyMeasurementCreate(BaseModel):
    weight_kg: float
    date: Optional[date] = None
    waist_cm: Optional[float] = None
    body_fat_pct: Optional[float] = None
    notes: Optional[str] = None

class BodyMeasurementOut(BaseModel):
    id: int
    date: date
    weight_kg: float
    bmi: Optional[float] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Foods -----------------
class FoodBase(BaseModel):
    name: str
    brand: Optional[str] = None
    category: Optional[str] = "General"
    standard_serving_name: Optional[str] = "100g"
    serving_size_g: Optional[float] = 100.0
    calories_per_100g: float
    protein_per_100g: float
    carbs_per_100g: float
    fat_per_100g: float
    fiber_per_100g: Optional[float] = 0.0
    barcode: Optional[str] = None
    data_source: Optional[str] = "custom"

class FoodCreate(FoodBase):
    pass

class FoodOut(FoodBase):
    id: int
    is_custom: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Meal Logging -----------------
class MealItemCreate(BaseModel):
    food_id: Optional[int] = None
    food_name_snapshot: str
    quantity: float = 1.0
    unit: str = "g"
    preparation_method: Optional[str] = "standard"
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = 0.0
    data_source: Optional[str] = "curated"
    recognition_confidence: Optional[float] = None
    image_url: Optional[str] = None

class MealItemOut(BaseModel):
    id: int
    meal_id: int
    food_id: Optional[int]
    food_name_snapshot: str
    quantity: float
    unit: str
    normalized_quantity_g: float
    preparation_method: Optional[str]
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float]
    recognition_confidence: Optional[float]
    image_url: Optional[str]

    class Config:
        from_attributes = True

class MealCreate(BaseModel):
    meal_type: str  # breakfast, morning_snack, lunch, evening_snack, dinner, custom
    name: Optional[str] = None
    date: Optional[date] = None
    time: Optional[str] = "12:00"
    notes: Optional[str] = None
    items: List[MealItemCreate] = []

class MealUpdate(BaseModel):
    meal_type: Optional[str] = None
    name: Optional[str] = None
    time: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[MealItemCreate]] = None

class MealOut(BaseModel):
    id: int
    user_id: int
    meal_type: str
    name: Optional[str]
    date: date
    time: str
    notes: Optional[str]
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    items: List[MealItemOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Recipes -----------------
class RecipeItemCreate(BaseModel):
    food_id: Optional[int] = None
    food_name: str
    quantity: float
    unit: str = "g"

class RecipeItemOut(BaseModel):
    id: int
    food_name: str
    quantity: float
    unit: str
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float

    class Config:
        from_attributes = True

class RecipeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    servings: int = 1
    items: List[RecipeItemCreate]

class RecipeOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    servings: int
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float
    fiber_per_serving: float
    items: List[RecipeItemOut] = []
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Hydration -----------------
class HydrationCreate(BaseModel):
    amount_ml: float
    date: Optional[date] = None

class HydrationOut(BaseModel):
    id: int
    amount_ml: float
    date: date
    logged_at: datetime

    class Config:
        from_attributes = True

# ----------------- Text Parser -----------------
class TextParseRequest(BaseModel):
    text: str

class TextParseResponse(BaseModel):
    original_text: str
    detected_items: List[Dict[str, Any]]
    has_ambiguity: bool
    clarification_questions: List[str]

# ----------------- Notifications -----------------
class NotificationPrefUpdate(BaseModel):
    meal_reminders: Optional[bool] = None
    hydration_reminders: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    email_notifications: Optional[bool] = None

class NotificationPrefOut(BaseModel):
    id: int
    meal_reminders: bool
    hydration_reminders: bool
    quiet_hours_start: str
    quiet_hours_end: str
    email_notifications: bool

    class Config:
        from_attributes = True
