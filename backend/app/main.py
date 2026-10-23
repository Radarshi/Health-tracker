import logging
from datetime import date, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import hash_password
from app.models.all_models import (
    User, UserProfile, NutritionTarget, BodyMeasurement,
    Meal, MealItem, HydrationEntry
)
from app.services.food_db_service import FoodDatabaseService
from app.services.nutrition_engine import NutritionEngine

# Routers
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.foods import router as foods_router
from app.api.v1.meals import router as meals_router
from app.api.v1.recipes import router as recipes_router
from app.api.v1.recognition import router as recognition_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.hydration import router as hydration_router
from app.api.v1.barcode import router as barcode_router
from app.api.v1.data_management import router as data_mgmt_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nutritrack")

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Nutrition & Calorie Tracking Platform REST API with FoodSAM AI, USDA FoodData Central, and Open Food Facts integrations.",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file mount for food uploads
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(foods_router, prefix=settings.API_V1_STR)
app.include_router(meals_router, prefix=settings.API_V1_STR)
app.include_router(recipes_router, prefix=settings.API_V1_STR)
app.include_router(recognition_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(hydration_router, prefix=settings.API_V1_STR)
app.include_router(barcode_router, prefix=settings.API_V1_STR)
app.include_router(data_mgmt_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def on_startup():
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Seed initial foods catalog
        FoodDatabaseService.seed_initial_catalog(db)

        # Seed default demo user for frictionless evaluation
        demo_user = db.query(User).filter(User.email == "demo@nutritrack.ai").first()
        if not demo_user:
            logger.info("Seeding demo account (demo@nutritrack.ai)...")
            demo_user = User(
                email="demo@nutritrack.ai",
                hashed_password=hash_password("demopassword"),
                full_name="Alex Morgan"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            profile = UserProfile(
                user_id=demo_user.id,
                age=27,
                sex="male",
                height_cm=176.0,
                current_weight_kg=73.5,
                target_weight_kg=70.0,
                activity_level="moderate",
                goal="lose_weight",
                preferred_rate=0.5,
                dietary_preferences="balanced",
                preferred_units="metric"
            )
            db.add(profile)

            # Targets
            targets = NutritionEngine.calculate_targets(
                weight_kg=73.5,
                height_cm=176.0,
                age=27,
                sex="male",
                activity_level="moderate",
                goal="lose_weight",
                preferred_rate=0.5
            )
            nutrition_target = NutritionTarget(user_id=demo_user.id, **targets)
            db.add(nutrition_target)

            # Seed 7 days of realistic history
            today = date.today()
            for i in range(7):
                d = today - timedelta(days=6 - i)
                # Weight progression
                w = 74.2 - (i * 0.1)
                db.add(BodyMeasurement(
                    user_id=demo_user.id,
                    date=d,
                    weight_kg=round(w, 1),
                    bmi=NutritionEngine.calculate_bmi(w, 176.0)["bmi"],
                    notes="Morning check-in"
                ))
                # Hydration
                db.add(HydrationEntry(
                    user_id=demo_user.id,
                    date=d,
                    amount_ml=2200 + (i * 50)
                ))

                # Breakfast
                b_meal = Meal(
                    user_id=demo_user.id,
                    meal_type="breakfast",
                    name="Power Oats & Boiled Eggs",
                    date=d,
                    time="08:30",
                    total_calories=420.0,
                    total_protein_g=28.0,
                    total_carbs_g=48.0,
                    total_fat_g=12.0,
                    total_fiber_g=4.0
                )
                db.add(b_meal)
                db.flush()
                db.add(MealItem(
                    meal_id=b_meal.id,
                    food_name_snapshot="Cooked Oatmeal",
                    quantity=1.0,
                    unit="bowl",
                    normalized_quantity_g=200.0,
                    calories=142.0,
                    protein_g=5.0,
                    carbs_g=24.0,
                    fat_g=3.0,
                    fiber_g=3.4
                ))
                db.add(MealItem(
                    meal_id=b_meal.id,
                    food_name_snapshot="Whole Boiled Egg",
                    quantity=2.0,
                    unit="pieces",
                    normalized_quantity_g=100.0,
                    calories=155.0,
                    protein_g=12.6,
                    carbs_g=1.1,
                    fat_g=10.6,
                    fiber_g=0.0
                ))

                # Lunch
                l_meal = Meal(
                    user_id=demo_user.id,
                    meal_type="lunch",
                    name="Traditional Rice, Dal & Fish Curry",
                    date=d,
                    time="13:15",
                    total_calories=645.0,
                    total_protein_g=42.0,
                    total_carbs_g=78.0,
                    total_fat_g=14.0,
                    total_fiber_g=6.0
                )
                db.add(l_meal)
                db.flush()
                db.add(MealItem(
                    meal_id=l_meal.id,
                    food_name_snapshot="Cooked White Rice (Basmati / Sona Masoori)",
                    quantity=150.0,
                    unit="g",
                    normalized_quantity_g=150.0,
                    calories=195.0,
                    protein_g=4.1,
                    carbs_g=42.3,
                    fat_g=0.5,
                    fiber_g=0.6
                ))
                db.add(MealItem(
                    meal_id=l_meal.id,
                    food_name_snapshot="Yellow Dal Tadka (Cooked Toor / Moong)",
                    quantity=1.0,
                    unit="bowl",
                    normalized_quantity_g=200.0,
                    calories=210.0,
                    protein_g=12.4,
                    carbs_g=29.0,
                    fat_g=5.6,
                    fiber_g=7.0
                ))
                db.add(MealItem(
                    meal_id=l_meal.id,
                    food_name_snapshot="Bengali Fish Curry (Macher Jhol with Rohu/Katla)",
                    quantity=1.0,
                    unit="bowl",
                    normalized_quantity_g=180.0,
                    calories=207.0,
                    protein_g=25.2,
                    carbs_g=6.8,
                    fat_g=9.0,
                    fiber_g=1.4
                ))

                # Dinner
                d_meal = Meal(
                    user_id=demo_user.id,
                    meal_type="dinner",
                    name="Rotis with Grilled Chicken & Salad",
                    date=d,
                    time="20:00",
                    total_calories=560.0,
                    total_protein_g=52.0,
                    total_carbs_g=58.0,
                    total_fat_g=11.0,
                    total_fiber_g=7.0
                )
                db.add(d_meal)
                db.flush()
                db.add(MealItem(
                    meal_id=d_meal.id,
                    food_name_snapshot="Whole Wheat Roti / Chapati (Without Ghee)",
                    quantity=2.0,
                    unit="rotis",
                    normalized_quantity_g=70.0,
                    calories=184.8,
                    protein_g=6.4,
                    carbs_g=37.8,
                    fat_g=1.1,
                    fiber_g=4.8
                ))
                db.add(MealItem(
                    meal_id=d_meal.id,
                    food_name_snapshot="Grilled Chicken Breast (Skinless)",
                    quantity=150.0,
                    unit="g",
                    normalized_quantity_g=150.0,
                    calories=247.5,
                    protein_g=46.5,
                    carbs_g=0.0,
                    fat_g=5.4,
                    fiber_g=0.0
                ))

            db.commit()
            logger.info("Demo user and sample historical logs successfully seeded!")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
