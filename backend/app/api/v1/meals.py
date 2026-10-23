from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Optional
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, Meal, MealItem, Food
from app.schemas.schemas import MealCreate, MealUpdate, MealOut, MealItemCreate
from app.services.nutrition_engine import NutritionEngine

router = APIRouter(prefix="/meals", tags=["Meal Logging"])

@router.post("", response_model=MealOut)
def create_meal(
    meal_in: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = meal_in.date or date.today()
    meal = Meal(
        user_id=current_user.id,
        meal_type=meal_in.meal_type,
        name=meal_in.name or meal_in.meal_type.replace("_", " ").title(),
        date=target_date,
        time=meal_in.time or datetime.now().strftime("%H:%M"),
        notes=meal_in.notes
    )
    db.add(meal)
    db.flush()  # assign meal.id

    process_and_attach_meal_items(meal, meal_in.items, db)
    db.commit()
    db.refresh(meal)
    return meal

@router.get("", response_model=List[MealOut])
def get_meals(
    meal_date: Optional[date] = Query(None, description="Filter meals by exact date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Meal).filter(Meal.user_id == current_user.id)
    if meal_date:
        query = query.filter(Meal.date == meal_date)
    return query.order_by(Meal.time.asc(), Meal.created_at.asc()).all()

@router.get("/{meal_id}", response_model=MealOut)
def get_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    return meal

@router.put("/{meal_id}", response_model=MealOut)
def update_meal(
    meal_id: int,
    meal_in: MealUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")

    if meal_in.meal_type is not None:
        meal.meal_type = meal_in.meal_type
    if meal_in.name is not None:
        meal.name = meal_in.name
    if meal_in.time is not None:
        meal.time = meal_in.time
    if meal_in.notes is not None:
        meal.notes = meal_in.notes

    if meal_in.items is not None:
        # Clear existing items and replace
        db.query(MealItem).filter(MealItem.meal_id == meal.id).delete()
        process_and_attach_meal_items(meal, meal_in.items, db)

    db.commit()
    db.refresh(meal)
    return meal

@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
    db.delete(meal)
    db.commit()
    return {"message": "Meal deleted successfully", "meal_id": meal_id}

@router.post("/{meal_id}/duplicate", response_model=MealOut)
def duplicate_meal(
    meal_id: int,
    target_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source_meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not source_meal:
        raise HTTPException(status_code=404, detail="Source meal not found")

    new_meal = Meal(
        user_id=current_user.id,
        meal_type=source_meal.meal_type,
        name=f"{source_meal.name} (Copy)",
        date=target_date or date.today(),
        time=datetime.now().strftime("%H:%M"),
        notes=source_meal.notes,
        total_calories=source_meal.total_calories,
        total_protein_g=source_meal.total_protein_g,
        total_carbs_g=source_meal.total_carbs_g,
        total_fat_g=source_meal.total_fat_g,
        total_fiber_g=source_meal.total_fiber_g
    )
    db.add(new_meal)
    db.flush()

    for item in source_meal.items:
        new_item = MealItem(
            meal_id=new_meal.id,
            food_id=item.food_id,
            food_name_snapshot=item.food_name_snapshot,
            quantity=item.quantity,
            unit=item.unit,
            normalized_quantity_g=item.normalized_quantity_g,
            preparation_method=item.preparation_method,
            calories=item.calories,
            protein_g=item.protein_g,
            carbs_g=item.carbs_g,
            fat_g=item.fat_g,
            fiber_g=item.fiber_g,
            data_source=item.data_source,
            recognition_confidence=item.recognition_confidence,
            image_url=item.image_url
        )
        db.add(new_item)

    db.commit()
    db.refresh(new_meal)
    return new_meal

def process_and_attach_meal_items(meal: Meal, items_in: List[MealItemCreate], db: Session):
    total_cal = 0.0
    total_p = 0.0
    total_c = 0.0
    total_f = 0.0
    total_fib = 0.0

    for itm in items_in:
        # Check if food in database
        food = None
        if itm.food_id:
            food = db.query(Food).filter(Food.id == itm.food_id).first()

        # If user explicitly supplied custom item calories/macros, use them;
        # otherwise compute from food base per 100g
        if itm.calories is not None and itm.calories > 0:
            cal = itm.calories
            p = itm.protein_g or 0.0
            c = itm.carbs_g or 0.0
            f = itm.fat_g or 0.0
            fib = itm.fiber_g or 0.0
            norm_g = NutritionEngine.normalize_quantity_to_grams(itm.quantity, itm.unit)
        elif food:
            calc = NutritionEngine.calculate_food_item_nutrition(
                calories_per_100g=food.calories_per_100g,
                protein_per_100g=food.protein_per_100g,
                carbs_per_100g=food.carbs_per_100g,
                fat_per_100g=food.fat_per_100g,
                fiber_per_100g=food.fiber_per_100g,
                quantity=itm.quantity,
                unit=itm.unit,
                serving_size_g=food.serving_size_g
            )
            cal = calc["calories"]
            p = calc["protein_g"]
            c = calc["carbs_g"]
            f = calc["fat_g"]
            fib = calc["fiber_g"]
            norm_g = calc["normalized_quantity_g"]
        else:
            # Fallback estimation (100 kcal / 100g baseline)
            norm_g = NutritionEngine.normalize_quantity_to_grams(itm.quantity, itm.unit)
            cal = round(norm_g * 1.2, 1)
            p = round(norm_g * 0.04, 1)
            c = round(norm_g * 0.15, 1)
            f = round(norm_g * 0.03, 1)
            fib = 0.0

        meal_item = MealItem(
            meal_id=meal.id,
            food_id=itm.food_id,
            food_name_snapshot=itm.food_name_snapshot,
            quantity=itm.quantity,
            unit=itm.unit,
            normalized_quantity_g=norm_g,
            preparation_method=itm.preparation_method,
            calories=cal,
            protein_g=p,
            carbs_g=c,
            fat_g=f,
            fiber_g=fib,
            data_source=itm.data_source or "curated",
            recognition_confidence=itm.recognition_confidence,
            image_url=itm.image_url
        )
        db.add(meal_item)

        total_cal += cal
        total_p += p
        total_c += c
        total_f += f
        total_fib += fib

    meal.total_calories = round(total_cal, 1)
    meal.total_protein_g = round(total_p, 1)
    meal.total_carbs_g = round(total_c, 1)
    meal.total_fat_g = round(total_f, 1)
    meal.total_fiber_g = round(total_fib, 1)
