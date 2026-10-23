from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.all_models import Food
from app.services.food_db_service import FoodDatabaseService

router = APIRouter(prefix="/products", tags=["Barcode & Packaged Products"])

@router.get("/barcode/{barcode}")
async def lookup_product_by_barcode(barcode: str, db: Session = Depends(get_db)):
    # 1. Check local catalog first
    local = db.query(Food).filter(Food.barcode == barcode).first()
    if local:
        return {
            "name": local.name,
            "brand": local.brand,
            "category": local.category,
            "standard_serving_name": local.standard_serving_name,
            "serving_size_g": local.serving_size_g,
            "calories_per_100g": local.calories_per_100g,
            "protein_per_100g": local.protein_per_100g,
            "carbs_per_100g": local.carbs_per_100g,
            "fat_per_100g": local.fat_per_100g,
            "fiber_per_100g": local.fiber_per_100g,
            "barcode": local.barcode,
            "data_source": "local_database"
        }

    # 2. Query Open Food Facts
    product_data = await FoodDatabaseService.fetch_open_food_facts_barcode(barcode)
    if product_data:
        # Cache product in local database for subsequent requests
        cached_food = Food(
            name=product_data["name"],
            brand=product_data["brand"],
            category=product_data["category"],
            standard_serving_name=product_data["standard_serving_name"],
            serving_size_g=product_data["serving_size_g"],
            calories_per_100g=product_data["calories_per_100g"],
            protein_per_100g=product_data["protein_per_100g"],
            carbs_per_100g=product_data["carbs_per_100g"],
            fat_per_100g=product_data["fat_per_100g"],
            fiber_per_100g=product_data["fiber_per_100g"],
            barcode=barcode,
            data_source="openfoodfacts"
        )
        db.add(cached_food)
        db.commit()
        db.refresh(cached_food)
        product_data["id"] = cached_food.id
        return product_data

    raise HTTPException(status_code=404, detail=f"No packaged product found for barcode '{barcode}'")
