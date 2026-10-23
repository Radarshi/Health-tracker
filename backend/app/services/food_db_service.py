import httpx
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.all_models import Food
from app.core.config import settings

logger = logging.getLogger(__name__)

# Pre-seeded comprehensive food database (curated Indian & global staple foods with accurate per 100g nutrition)
CURATED_FOODS = [
    {
        "name": "Cooked White Rice (Basmati / Sona Masoori)",
        "brand": "Staple",
        "category": "Grains",
        "standard_serving_name": "1 bowl (150g)",
        "serving_size_g": 150.0,
        "calories_per_100g": 130.0,
        "protein_per_100g": 2.7,
        "carbs_per_100g": 28.2,
        "fat_per_100g": 0.3,
        "fiber_per_100g": 0.4,
        "data_source": "curated",
    },
    {
        "name": "Cooked Brown Rice",
        "brand": "Staple",
        "category": "Grains",
        "standard_serving_name": "1 bowl (150g)",
        "serving_size_g": 150.0,
        "calories_per_100g": 111.0,
        "protein_per_100g": 2.6,
        "carbs_per_100g": 23.0,
        "fat_per_100g": 0.9,
        "fiber_per_100g": 1.8,
        "data_source": "curated",
    },
    {
        "name": "Whole Wheat Roti / Chapati (Without Ghee)",
        "brand": "Staple",
        "category": "Breads",
        "standard_serving_name": "1 medium roti (35g)",
        "serving_size_g": 35.0,
        "calories_per_100g": 264.0,  # ~92 kcal per 35g roti
        "protein_per_100g": 9.1,
        "carbs_per_100g": 54.0,
        "fat_per_100g": 1.5,
        "fiber_per_100g": 6.8,
        "data_source": "curated",
    },
    {
        "name": "Yellow Dal Tadka (Cooked Toor / Moong)",
        "brand": "Traditional",
        "category": "Lentils",
        "standard_serving_name": "1 bowl (200g)",
        "serving_size_g": 200.0,
        "calories_per_100g": 105.0,
        "protein_per_100g": 6.2,
        "carbs_per_100g": 14.5,
        "fat_per_100g": 2.8,
        "fiber_per_100g": 3.5,
        "data_source": "curated",
    },
    {
        "name": "Chicken Curry (Home Style)",
        "brand": "Traditional",
        "category": "Poultry",
        "standard_serving_name": "1 serving (150g)",
        "serving_size_g": 150.0,
        "calories_per_100g": 148.0,
        "protein_per_100g": 16.5,
        "carbs_per_100g": 4.2,
        "fat_per_100g": 7.5,
        "fiber_per_100g": 1.1,
        "data_source": "curated",
    },
    {
        "name": "Bengali Fish Curry (Macher Jhol with Rohu/Katla)",
        "brand": "Traditional",
        "category": "Seafood",
        "standard_serving_name": "1 bowl (180g)",
        "serving_size_g": 180.0,
        "calories_per_100g": 115.0,
        "protein_per_100g": 14.0,
        "carbs_per_100g": 3.8,
        "fat_per_100g": 5.0,
        "fiber_per_100g": 0.8,
        "data_source": "curated",
    },
    {
        "name": "Paneer Butter Masala",
        "brand": "Traditional",
        "category": "Dairy",
        "standard_serving_name": "1 bowl (200g)",
        "serving_size_g": 200.0,
        "calories_per_100g": 195.0,
        "protein_per_100g": 8.5,
        "carbs_per_100g": 7.8,
        "fat_per_100g": 15.2,
        "fiber_per_100g": 1.5,
        "data_source": "curated",
    },
    {
        "name": "Raw Paneer (Cottage Cheese)",
        "brand": "Dairy",
        "category": "Dairy",
        "standard_serving_name": "100g",
        "serving_size_g": 100.0,
        "calories_per_100g": 265.0,
        "protein_per_100g": 18.3,
        "carbs_per_100g": 3.4,
        "fat_per_100g": 20.8,
        "fiber_per_100g": 0.0,
        "data_source": "curated",
    },
    {
        "name": "Whole Boiled Egg",
        "brand": "Staple",
        "category": "Eggs",
        "standard_serving_name": "1 large egg (50g)",
        "serving_size_g": 50.0,
        "calories_per_100g": 155.0,  # ~78 kcal per 50g egg
        "protein_per_100g": 12.6,
        "carbs_per_100g": 1.1,
        "fat_per_100g": 10.6,
        "fiber_per_100g": 0.0,
        "data_source": "curated",
    },
    {
        "name": "Egg Omelette (with Onions & Chilies)",
        "brand": "Breakfast",
        "category": "Eggs",
        "standard_serving_name": "2 eggs (110g)",
        "serving_size_g": 110.0,
        "calories_per_100g": 172.0,
        "protein_per_100g": 11.5,
        "carbs_per_100g": 2.5,
        "fat_per_100g": 13.0,
        "fiber_per_100g": 0.4,
        "data_source": "curated",
    },
    {
        "name": "Grilled Chicken Breast (Skinless)",
        "brand": "Poultry",
        "category": "Poultry",
        "standard_serving_name": "1 breast (150g)",
        "serving_size_g": 150.0,
        "calories_per_100g": 165.0,
        "protein_per_100g": 31.0,
        "carbs_per_100g": 0.0,
        "fat_per_100g": 3.6,
        "fiber_per_100g": 0.0,
        "data_source": "curated",
    },
    {
        "name": "Oatmeal (Cooked with Water)",
        "brand": "Breakfast",
        "category": "Cereals",
        "standard_serving_name": "1 bowl (200g)",
        "serving_size_g": 200.0,
        "calories_per_100g": 71.0,
        "protein_per_100g": 2.5,
        "carbs_per_100g": 12.0,
        "fat_per_100g": 1.5,
        "fiber_per_100g": 1.7,
        "data_source": "curated",
    },
    {
        "name": "Curd / Plain Yogurt (Dahi)",
        "brand": "Dairy",
        "category": "Dairy",
        "standard_serving_name": "1 cup (150g)",
        "serving_size_g": 150.0,
        "calories_per_100g": 61.0,
        "protein_per_100g": 3.5,
        "carbs_per_100g": 4.7,
        "fat_per_100g": 3.3,
        "fiber_per_100g": 0.0,
        "data_source": "curated",
    },
    {
        "name": "Banana (Fresh)",
        "brand": "Produce",
        "category": "Fruits",
        "standard_serving_name": "1 medium (118g)",
        "serving_size_g": 118.0,
        "calories_per_100g": 89.0,
        "protein_per_100g": 1.1,
        "carbs_per_100g": 22.8,
        "fat_per_100g": 0.3,
        "fiber_per_100g": 2.6,
        "data_source": "curated",
    },
    {
        "name": "Apple (Fresh with Skin)",
        "brand": "Produce",
        "category": "Fruits",
        "standard_serving_name": "1 medium (182g)",
        "serving_size_g": 182.0,
        "calories_per_100g": 52.0,
        "protein_per_100g": 0.3,
        "carbs_per_100g": 13.8,
        "fat_per_100g": 0.2,
        "fiber_per_100g": 2.4,
        "data_source": "curated",
    },
    {
        "name": "Mixed Green Salad (Cucumber, Tomato, Onion)",
        "brand": "Produce",
        "category": "Vegetables",
        "standard_serving_name": "1 bowl (150g)",
        "serving_size_g": 150.0,
        "calories_per_100g": 22.0,
        "protein_per_100g": 1.0,
        "carbs_per_100g": 4.2,
        "fat_per_100g": 0.2,
        "fiber_per_100g": 1.5,
        "data_source": "curated",
    },
    {
        "name": "Masala Dosa with Sambar",
        "brand": "Traditional",
        "category": "South Indian",
        "standard_serving_name": "1 piece (180g)",
        "serving_size_g": 180.0,
        "calories_per_100g": 168.0,
        "protein_per_100g": 4.1,
        "carbs_per_100g": 25.4,
        "fat_per_100g": 5.8,
        "fiber_per_100g": 2.2,
        "data_source": "curated",
    },
    {
        "name": "Steamed Idli (2 pieces)",
        "brand": "Traditional",
        "category": "South Indian",
        "standard_serving_name": "2 idlis (100g)",
        "serving_size_g": 100.0,
        "calories_per_100g": 132.0,
        "protein_per_100g": 4.2,
        "carbs_per_100g": 27.0,
        "fat_per_100g": 0.6,
        "fiber_per_100g": 1.4,
        "data_source": "curated",
    },
    {
        "name": "Almonds (Raw)",
        "brand": "Produce",
        "category": "Nuts",
        "standard_serving_name": "Handful (28g)",
        "serving_size_g": 28.0,
        "calories_per_100g": 579.0,
        "protein_per_100g": 21.2,
        "carbs_per_100g": 21.6,
        "fat_per_100g": 49.9,
        "fiber_per_100g": 12.5,
        "data_source": "curated",
    },
    {
        "name": "Whey Protein Powder (Gold Standard)",
        "brand": "Optimum Nutrition",
        "category": "Supplements",
        "standard_serving_name": "1 scoop (30g)",
        "serving_size_g": 30.0,
        "calories_per_100g": 400.0,
        "protein_per_100g": 80.0,
        "carbs_per_100g": 10.0,
        "fat_per_100g": 3.3,
        "fiber_per_100g": 1.0,
        "data_source": "curated",
    }
]

class FoodDatabaseService:
    @classmethod
    def seed_initial_catalog(cls, db: Session):
        """Seed the local database with curated foods if empty."""
        count = db.query(Food).count()
        if count == 0:
            for item in CURATED_FOODS:
                food = Food(**item)
                db.add(food)
            db.commit()

    @classmethod
    def search_local_foods(cls, db: Session, query: str, limit: int = 20) -> List[Food]:
        """Search foods within the local database."""
        search_pattern = f"%{query}%"
        return db.query(Food).filter(
            Food.name.ilike(search_pattern) | 
            Food.brand.ilike(search_pattern) | 
            Food.category.ilike(search_pattern)
        ).limit(limit).all()

    @classmethod
    async def search_usda_foods(cls, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Query USDA FoodData Central REST API."""
        try:
            url = f"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={settings.USDA_API_KEY}&query={query}&pageSize={limit}"
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for f in data.get("foods", []):
                        nutrients = {n.get("nutrientName", "").lower(): n.get("value", 0.0) for n in f.get("foodNutrients", [])}
                        
                        calories = nutrients.get("energy", 0.0)
                        protein = nutrients.get("protein", 0.0)
                        carbs = nutrients.get("carbohydrate, by difference", 0.0)
                        fat = nutrients.get("total lipid (fat)", 0.0)
                        fiber = nutrients.get("fiber, total dietary", 0.0)
                        
                        results.append({
                            "name": f.get("description", "").title(),
                            "brand": f.get("brandOwner") or "USDA FoodData",
                            "category": f.get("foodCategory", "Food"),
                            "standard_serving_name": "100g",
                            "serving_size_g": 100.0,
                            "calories_per_100g": round(calories, 1),
                            "protein_per_100g": round(protein, 1),
                            "carbs_per_100g": round(carbs, 1),
                            "fat_per_100g": round(fat, 1),
                            "fiber_per_100g": round(fiber, 1),
                            "data_source": "usda",
                            "fdc_id": str(f.get("fdcId", ""))
                        })
                    return results
        except Exception as e:
            logger.warning(f"USDA search failed or timed out: {e}")
        return []

    @classmethod
    async def fetch_open_food_facts_barcode(cls, barcode: str) -> Optional[Dict[str, Any]]:
        """Query Open Food Facts for packaged goods by barcode."""
        try:
            url = f"{settings.OPEN_FOOD_FACTS_BASE_URL}/product/{barcode}.json"
            headers = {"User-Agent": "NutriTrackAI/1.0 (contact@nutritrack.ai)"}
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    if data.get("status") == 1:
                        product = data.get("product", {})
                        nutriments = product.get("nutriments", {})
                        
                        serving_size_g = 100.0
                        serving_qty = product.get("serving_quantity")
                        if serving_qty:
                            try:
                                serving_size_g = float(serving_qty)
                            except (ValueError, TypeError):
                                pass

                        return {
                            "name": product.get("product_name", "Packaged Product"),
                            "brand": product.get("brands", "Brand"),
                            "category": product.get("categories", "Packaged Foods").split(",")[0],
                            "standard_serving_name": product.get("serving_size") or f"{serving_size_g}g",
                            "serving_size_g": serving_size_g,
                            "calories_per_100g": round(nutriments.get("energy-kcal_100g", nutriments.get("energy_100g", 0.0) / 4.184), 1),
                            "protein_per_100g": round(nutriments.get("proteins_100g", 0.0), 1),
                            "carbs_per_100g": round(nutriments.get("carbohydrates_100g", 0.0), 1),
                            "fat_per_100g": round(nutriments.get("fat_100g", 0.0), 1),
                            "fiber_per_100g": round(nutriments.get("fiber_100g", 0.0), 1),
                            "barcode": barcode,
                            "data_source": "openfoodfacts",
                            "image_url": product.get("image_front_url")
                        }
        except Exception as e:
            logger.warning(f"Open Food Facts lookup failed: {e}")
        return None
