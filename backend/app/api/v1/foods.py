from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, Food, FavoriteFood
from app.schemas.schemas import FoodCreate, FoodOut, TextParseRequest, TextParseResponse
from app.services.food_db_service import FoodDatabaseService
from app.services.text_parser_service import NaturalLanguageFoodParser

router = APIRouter(prefix="/foods", tags=["Food Database"])

@router.get("/search")
async def search_foods(
    q: str = Query(..., min_length=1, description="Food name or keyword"),
    include_usda: bool = Query(True, description="Query USDA external database if local results are few"),
    db: Session = Depends(get_db)
):
    # Search local database
    local_foods = FoodDatabaseService.search_local_foods(db, q, limit=20)
    results = [
        {
            "id": f.id,
            "name": f.name,
            "brand": f.brand,
            "category": f.category,
            "standard_serving_name": f.standard_serving_name,
            "serving_size_g": f.serving_size_g,
            "calories_per_100g": f.calories_per_100g,
            "protein_per_100g": f.protein_per_100g,
            "carbs_per_100g": f.carbs_per_100g,
            "fat_per_100g": f.fat_per_100g,
            "fiber_per_100g": f.fiber_per_100g,
            "data_source": f.data_source,
            "is_custom": f.is_custom
        }
        for f in local_foods
    ]

    # If few results and USDA requested, search USDA FoodData Central
    if len(results) < 5 and include_usda:
        usda_results = await FoodDatabaseService.search_usda_foods(q, limit=5)
        # Avoid duplicate names
        existing_names = {r["name"].lower() for r in results}
        for u in usda_results:
            if u["name"].lower() not in existing_names:
                results.append(u)

    return results

@router.get("/favorites", response_model=List[FoodOut])
def get_favorite_foods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = db.query(FavoriteFood).filter(FavoriteFood.user_id == current_user.id).all()
    food_ids = [f.food_id for f in favs]
    return db.query(Food).filter(Food.id.in_(food_ids)).all() if food_ids else []

@router.post("/favorites/{food_id}")
def toggle_favorite_food(
    food_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(FavoriteFood).filter(
        FavoriteFood.user_id == current_user.id,
        FavoriteFood.food_id == food_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"status": "removed", "food_id": food_id}
    else:
        fav = FavoriteFood(user_id=current_user.id, food_id=food_id)
        db.add(fav)
        db.commit()
        return {"status": "added", "food_id": food_id}

@router.post("/custom", response_model=FoodOut)
def create_custom_food(
    food_in: FoodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    food = Food(
        **food_in.model_dump(),
        is_custom=True,
        created_by_user_id=current_user.id
    )
    db.add(food)
    db.commit()
    db.refresh(food)
    return food

@router.post("/parse-text", response_model=TextParseResponse)
def parse_natural_language_food(req: TextParseRequest, db: Session = Depends(get_db)):
    """
    Parses natural language food log entry (e.g. 'two medium rotis and 1 bowl of dal')
    and attempts to match detected food tokens with local catalog items.
    """
    parsed = NaturalLanguageFoodParser.parse_text(req.text)
    
    # Enrich with matched foods
    for item in parsed["detected_items"]:
        match = FoodDatabaseService.search_local_foods(db, item["food_name"], limit=1)
        if match:
            matched_food = match[0]
            item["matched_food_id"] = matched_food.id
            item["matched_food_name"] = matched_food.name
            item["calories_per_100g"] = matched_food.calories_per_100g
            item["protein_per_100g"] = matched_food.protein_per_100g
            item["carbs_per_100g"] = matched_food.carbs_per_100g
            item["fat_per_100g"] = matched_food.fat_per_100g
            item["fiber_per_100g"] = matched_food.fiber_per_100g
            item["standard_serving_name"] = matched_food.standard_serving_name
            item["serving_size_g"] = matched_food.serving_size_g

    return parsed

@router.get("/{food_id}", response_model=FoodOut)
def get_food(food_id: int, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.id == food_id).first()
    if not food:
        raise HTTPException(status_code=404, detail="Food item not found")
    return food
