from typing import Dict, Any, Optional

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,      # Little or no exercise
    "light": 1.375,        # Light exercise 1-3 days/week
    "moderate": 1.55,      # Moderate exercise 3-5 days/week
    "active": 1.725,       # Hard exercise 6-7 days/week
    "very_active": 1.9,    # Very hard daily exercise or physical job
}

UNIT_CONVERSIONS_TO_GRAMS = {
    "g": 1.0,
    "gram": 1.0,
    "grams": 1.0,
    "kg": 1000.0,
    "kilogram": 1000.0,
    "kilograms": 1000.0,
    "mg": 0.001,
    "oz": 28.3495,
    "ounce": 28.3495,
    "ounces": 28.3495,
    "lb": 453.592,
    "pound": 453.592,
    "pounds": 453.592,
    "ml": 1.0,  # Assumes density 1.0 g/ml unless overridden
    "milliliter": 1.0,
    "milliliters": 1.0,
    "l": 1000.0,
    "liter": 1000.0,
    "liters": 1000.0,
    "cup": 240.0,
    "cups": 240.0,
    "tbsp": 15.0,
    "tablespoon": 15.0,
    "tablespoons": 15.0,
    "tsp": 5.0,
    "teaspoon": 5.0,
    "teaspoons": 5.0,
    "bowl": 250.0,
    "bowls": 250.0,
    "medium bowl": 250.0,
    "small bowl": 150.0,
    "large bowl": 350.0,
    "katori": 150.0,
    "plate": 400.0,
    "roti": 35.0,
    "rotis": 35.0,
    "chapati": 35.0,
    "chapatis": 35.0,
    "paratha": 75.0,
    "dosa": 90.0,
    "idli": 45.0,
    "slice": 30.0,
    "slices": 30.0,
    "piece": 50.0,
    "pieces": 50.0,
    "serving": 100.0,
    "servings": 100.0,
}

class NutritionEngine:
    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> Dict[str, Any]:
        """
        Calculate BMI and clinical screening classification.
        BMI = weight (kg) / (height (m) ^ 2)
        Note: Screening metric only, not a medical diagnosis.
        """
        if height_cm <= 0 or weight_kg <= 0:
            return {"bmi": 0.0, "category": "Unknown"}
        
        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m * height_m), 1)
        
        if bmi < 18.5:
            category = "Underweight"
        elif 18.5 <= bmi < 25.0:
            category = "Normal weight"
        elif 25.0 <= bmi < 30.0:
            category = "Overweight"
        else:
            category = "Obesity"
            
        return {"bmi": bmi, "category": category}

    @staticmethod
    def calculate_bmr_mifflin_st_jeor(
        weight_kg: float,
        height_cm: float,
        age: int,
        sex: Optional[str] = "male"
    ) -> float:
        """
        Calculate Basal Metabolic Rate using the Mifflin-St Jeor equation.
        Men: (10 x weight in kg) + (6.25 x height in cm) - (5 x age in years) + 5
        Women: (10 x weight in kg) + (6.25 x height in cm) - (5 x age in years) - 161
        Neutral/Other: (10 x weight in kg) + (6.25 x height in cm) - (5 x age in years) - 78
        """
        base = (10.0 * weight_kg) + (6.25 * height_cm) - (5.0 * age)
        sex_normalized = (sex or "other").strip().lower()
        
        if sex_normalized in ["male", "m", "man"]:
            bmr = base + 5.0
        elif sex_normalized in ["female", "f", "woman"]:
            bmr = base - 161.0
        else:
            bmr = base - 78.0
            
        return round(max(bmr, 800.0), 1)

    @staticmethod
    def calculate_tdee(bmr: float, activity_level: str) -> float:
        """
        Total Daily Energy Expenditure = BMR * Activity Multiplier
        """
        multiplier = ACTIVITY_MULTIPLIERS.get(activity_level.lower(), 1.55)
        return round(bmr * multiplier, 1)

    @classmethod
    def calculate_targets(
        cls,
        weight_kg: float,
        height_cm: float,
        age: int,
        sex: str = "male",
        activity_level: str = "moderate",
        goal: str = "maintain",
        preferred_rate: float = 0.5
    ) -> Dict[str, float]:
        """
        Calculate personalized daily caloric targets and macronutrient distribution.
        1 kg of fat ~= 7700 kcal.
        Safety limits: minimum 1200 kcal for females, 1500 kcal for males.
        """
        bmr = cls.calculate_bmr_mifflin_st_jeor(weight_kg, height_cm, age, sex)
        tdee = cls.calculate_tdee(bmr, activity_level)
        
        # Daily deficit or surplus in kcal
        weekly_kcal_delta = min(max(preferred_rate, 0.1), 1.0) * 7700.0
        daily_delta = weekly_kcal_delta / 7.0
        
        goal_lower = goal.lower()
        if "lose" in goal_lower:
            daily_calories = tdee - daily_delta
            # Safety floor
            min_safe = 1200.0 if (sex or "").lower() in ["female", "f"] else 1400.0
            daily_calories = max(daily_calories, min_safe)
        elif "gain" in goal_lower:
            daily_calories = tdee + daily_delta
        else:
            daily_calories = tdee
            
        daily_calories = round(daily_calories, 0)
        
        # Macronutrient allocation:
        # Protein: 2.0g per kg for weight loss, 1.8g for maintenance/gain
        protein_factor = 2.0 if "lose" in goal_lower else 1.8
        protein_g = round(min(weight_kg * protein_factor, daily_calories * 0.35 / 4.0), 1)
        
        # Fat: ~25-30% of total calories (9 kcal/g)
        fat_calories = daily_calories * 0.28
        fat_g = round(fat_calories / 9.0, 1)
        
        # Carbohydrates: remaining calories (4 kcal/g)
        remaining_kcal = max(daily_calories - (protein_g * 4.0 + fat_g * 9.0), 200.0)
        carbs_g = round(remaining_kcal / 4.0, 1)
        
        # Fiber: ~14g per 1000 kcal
        fiber_g = round((daily_calories / 1000.0) * 14.0, 1)
        
        # Hydration: 35 ml per kg body weight
        hydration_ml = round(max(weight_kg * 35.0, 2000.0), 0)
        
        return {
            "bmr": bmr,
            "tdee": tdee,
            "daily_calorie_target": daily_calories,
            "protein_g": protein_g,
            "carbs_g": carbs_g,
            "fat_g": fat_g,
            "fiber_g": fiber_g,
            "hydration_ml": hydration_ml,
        }

    @staticmethod
    def normalize_quantity_to_grams(
        quantity: float,
        unit: str,
        custom_serving_g: Optional[float] = None
    ) -> float:
        """
        Convert user-entered quantity and unit to normalized grams.
        """
        unit_clean = unit.strip().lower()
        if custom_serving_g and unit_clean in ["serving", "servings", "piece", "pieces", "item", "items"]:
            return round(quantity * custom_serving_g, 2)
            
        factor = UNIT_CONVERSIONS_TO_GRAMS.get(unit_clean, 1.0)
        return round(quantity * factor, 2)

    @classmethod
    def calculate_food_item_nutrition(
        cls,
        calories_per_100g: float,
        protein_per_100g: float,
        carbs_per_100g: float,
        fat_per_100g: float,
        fiber_per_100g: float,
        quantity: float,
        unit: str,
        serving_size_g: Optional[float] = 100.0
    ) -> Dict[str, float]:
        """
        Deterministic nutrient calculation formula:
        item_nutrient = nutrient_per_100g * normalized_quantity_g / 100
        """
        normalized_g = cls.normalize_quantity_to_grams(quantity, unit, serving_size_g)
        scale = normalized_g / 100.0

        return {
            "normalized_quantity_g": normalized_g,
            "calories": round(calories_per_100g * scale, 1),
            "protein_g": round(protein_per_100g * scale, 1),
            "carbs_g": round(carbs_per_100g * scale, 1),
            "fat_g": round(fat_per_100g * scale, 1),
            "fiber_g": round(fiber_per_100g * scale, 1),
        }

    @staticmethod
    def aggregate_nutrients(items: list) -> Dict[str, float]:
        """
        Sum up calories and macronutrients across a list of items or ingredients.
        """
        totals = {
            "total_calories": 0.0,
            "total_protein_g": 0.0,
            "total_carbs_g": 0.0,
            "total_fat_g": 0.0,
            "total_fiber_g": 0.0,
        }
        for item in items:
            totals["total_calories"] += getattr(item, "calories", 0.0) or item.get("calories", 0.0)
            totals["total_protein_g"] += getattr(item, "protein_g", 0.0) or item.get("protein_g", 0.0)
            totals["total_carbs_g"] += getattr(item, "carbs_g", 0.0) or item.get("carbs_g", 0.0)
            totals["total_fat_g"] += getattr(item, "fat_g", 0.0) or item.get("fat_g", 0.0)
            totals["total_fiber_g"] += getattr(item, "fiber_g", 0.0) or item.get("fiber_g", 0.0)

        return {k: round(v, 1) for k, v in totals.items()}
