from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, Recipe, RecipeItem, Food
from app.schemas.schemas import RecipeCreate, RecipeOut
from app.services.nutrition_engine import NutritionEngine

router = APIRouter(prefix="/recipes", tags=["Recipe Builder"])

@router.post("", response_model=RecipeOut)
def create_recipe(
    recipe_in: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    servings = max(recipe_in.servings, 1)
    recipe = Recipe(
        user_id=current_user.id,
        name=recipe_in.name,
        description=recipe_in.description,
        servings=servings
    )
    db.add(recipe)
    db.flush()

    total_cal, total_p, total_c, total_f, total_fib = 0.0, 0.0, 0.0, 0.0, 0.0

    for itm in recipe_in.items:
        food = db.query(Food).filter(Food.id == itm.food_id).first() if itm.food_id else None
        
        if food:
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
            norm_g = NutritionEngine.normalize_quantity_to_grams(itm.quantity, itm.unit)
            cal, p, c, f, fib = norm_g * 1.2, norm_g * 0.05, norm_g * 0.15, norm_g * 0.03, 0.0

        recipe_item = RecipeItem(
            recipe_id=recipe.id,
            food_id=itm.food_id,
            food_name=itm.food_name,
            quantity=itm.quantity,
            unit=itm.unit,
            normalized_quantity_g=norm_g,
            calories=cal,
            protein_g=p,
            carbs_g=c,
            fat_g=f,
            fiber_g=fib
        )
        db.add(recipe_item)

        total_cal += cal
        total_p += p
        total_c += c
        total_f += f
        total_fib += fib

    recipe.total_calories = round(total_cal, 1)
    recipe.total_protein_g = round(total_p, 1)
    recipe.total_carbs_g = round(total_c, 1)
    recipe.total_fat_g = round(total_f, 1)
    recipe.total_fiber_g = round(total_fib, 1)

    recipe.calories_per_serving = round(total_cal / servings, 1)
    recipe.protein_per_serving = round(total_p / servings, 1)
    recipe.carbs_per_serving = round(total_c / servings, 1)
    recipe.fat_per_serving = round(total_f / servings, 1)
    recipe.fiber_per_serving = round(total_fib / servings, 1)

    db.commit()
    db.refresh(recipe)
    return recipe

@router.get("", response_model=List[RecipeOut])
def get_recipes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Recipe).filter(Recipe.user_id == current_user.id).all()

@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == current_user.id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe

@router.delete("/{recipe_id}")
def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == current_user.id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()
    return {"message": "Recipe deleted successfully", "recipe_id": recipe_id}
