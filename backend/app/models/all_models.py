from datetime import datetime, date, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Date, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    targets = relationship("NutritionTarget", back_populates="user", uselist=False, cascade="all, delete-orphan")
    measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")
    meals = relationship("Meal", back_populates="user", cascade="all, delete-orphan")
    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")
    hydration = relationship("HydrationEntry", back_populates="user", cascade="all, delete-orphan")
    favorite_foods = relationship("FavoriteFood", back_populates="user", cascade="all, delete-orphan")
    favorite_meals = relationship("FavoriteMeal", back_populates="user", cascade="all, delete-orphan")
    notification_pref = relationship("NotificationPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recognition_jobs = relationship("RecognitionJob", back_populates="user", cascade="all, delete-orphan")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)  # male, female, other
    height_cm = Column(Float, nullable=True)
    current_weight_kg = Column(Float, nullable=True)
    target_weight_kg = Column(Float, nullable=True)
    activity_level = Column(String(50), default="moderate")  # sedentary, light, moderate, active, very_active
    goal = Column(String(50), default="maintain")  # lose_weight, maintain, gain_weight
    preferred_rate = Column(Float, default=0.5)  # kg/week
    dietary_preferences = Column(String(255), default="none")  # veg, non-veg, vegan, keto, halal, etc.
    allergies = Column(String(255), nullable=True)
    health_notes = Column(Text, nullable=True)
    preferred_units = Column(String(20), default="metric")  # metric, imperial
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="profile")


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, default=date.today, index=True)
    weight_kg = Column(Float, nullable=False)
    bmi = Column(Float, nullable=True)
    body_fat_pct = Column(Float, nullable=True)
    waist_cm = Column(Float, nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="measurements")


class NutritionTarget(Base):
    __tablename__ = "nutrition_targets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    bmr = Column(Float, default=1600.0)
    tdee = Column(Float, default=2200.0)
    daily_calorie_target = Column(Float, default=2000.0)
    protein_g = Column(Float, default=130.0)
    carbs_g = Column(Float, default=220.0)
    fat_g = Column(Float, default=65.0)
    fiber_g = Column(Float, default=30.0)
    hydration_ml = Column(Float, default=2500.0)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="targets")


class Food(Base):
    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    brand = Column(String(255), nullable=True)
    category = Column(String(100), nullable=True)
    standard_serving_name = Column(String(100), default="100g")
    serving_size_g = Column(Float, default=100.0)
    
    # Nutrients per 100g
    calories_per_100g = Column(Float, nullable=False, default=0.0)
    protein_per_100g = Column(Float, nullable=False, default=0.0)
    carbs_per_100g = Column(Float, nullable=False, default=0.0)
    fat_per_100g = Column(Float, nullable=False, default=0.0)
    fiber_per_100g = Column(Float, default=0.0)
    sodium_mg_100g = Column(Float, default=0.0)
    potassium_mg_100g = Column(Float, default=0.0)
    
    # Metadata
    data_source = Column(String(50), default="curated")  # usda, openfoodfacts, curated, custom
    fdc_id = Column(String(100), nullable=True, index=True)
    barcode = Column(String(100), nullable=True, index=True)
    is_custom = Column(Boolean, default=False)
    created_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_type = Column(String(50), nullable=False)  # breakfast, morning_snack, lunch, evening_snack, dinner, custom
    name = Column(String(255), nullable=True)
    date = Column(Date, default=date.today, index=True, nullable=False)
    time = Column(String(10), default="12:00")
    notes = Column(Text, nullable=True)

    # Aggregated totals
    total_calories = Column(Float, default=0.0)
    total_protein_g = Column(Float, default=0.0)
    total_carbs_g = Column(Float, default=0.0)
    total_fat_g = Column(Float, default=0.0)
    total_fiber_g = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="meals")
    items = relationship("MealItem", back_populates="meal", cascade="all, delete-orphan")


class MealItem(Base):
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="SET NULL"), nullable=True)
    
    food_name_snapshot = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False, default=1.0)
    unit = Column(String(50), nullable=False, default="g")
    normalized_quantity_g = Column(Float, nullable=False, default=100.0)
    preparation_method = Column(String(100), nullable=True)  # boiled, fried, raw, cooked, etc.

    # Calculated nutrition snapshot for this exact logged item
    calories = Column(Float, nullable=False, default=0.0)
    protein_g = Column(Float, nullable=False, default=0.0)
    carbs_g = Column(Float, nullable=False, default=0.0)
    fat_g = Column(Float, nullable=False, default=0.0)
    fiber_g = Column(Float, default=0.0)

    data_source = Column(String(50), default="curated")
    recognition_confidence = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    meal = relationship("Meal", back_populates="items")
    food = relationship("Food")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    servings = Column(Integer, default=1, nullable=False)

    # Total and Per-Serving Nutrition
    total_calories = Column(Float, default=0.0)
    total_protein_g = Column(Float, default=0.0)
    total_carbs_g = Column(Float, default=0.0)
    total_fat_g = Column(Float, default=0.0)
    total_fiber_g = Column(Float, default=0.0)

    calories_per_serving = Column(Float, default=0.0)
    protein_per_serving = Column(Float, default=0.0)
    carbs_per_serving = Column(Float, default=0.0)
    fat_per_serving = Column(Float, default=0.0)
    fiber_per_serving = Column(Float, default=0.0)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="recipes")
    items = relationship("RecipeItem", back_populates="recipe", cascade="all, delete-orphan")


class RecipeItem(Base):
    __tablename__ = "recipe_items"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="SET NULL"), nullable=True)
    food_name = Column(String(255), nullable=False)
    quantity = Column(Float, default=100.0)
    unit = Column(String(50), default="g")
    normalized_quantity_g = Column(Float, default=100.0)
    calories = Column(Float, default=0.0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)

    recipe = relationship("Recipe", back_populates="items")


class FavoriteFood(Base):
    __tablename__ = "favorite_foods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    food_id = Column(Integer, ForeignKey("foods.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="favorite_foods")
    food = relationship("Food")


class FavoriteMeal(Base):
    __tablename__ = "favorite_meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    meal_type = Column(String(50), default="lunch")
    items_json = Column(JSON, nullable=False)
    total_calories = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="favorite_meals")


class HydrationEntry(Base):
    __tablename__ = "hydration_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, default=date.today, index=True, nullable=False)
    amount_ml = Column(Float, nullable=False)
    logged_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="hydration")


class RecognitionJob(Base):
    __tablename__ = "recognition_jobs"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(500), nullable=False)
    filename = Column(String(255), nullable=True)
    status = Column(String(50), default="completed")  # processing, completed, failed
    detections_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="recognition_jobs")


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    meal_reminders = Column(Boolean, default=True)
    hydration_reminders = Column(Boolean, default=True)
    quiet_hours_start = Column(String(10), default="22:00")
    quiet_hours_end = Column(String(10), default="07:00")
    email_notifications = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="notification_pref")
