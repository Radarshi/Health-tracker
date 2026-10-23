import pytest
from app.services.nutrition_engine import NutritionEngine
from app.services.text_parser_service import NaturalLanguageFoodParser

def test_bmi_calculation():
    # 70 kg, 175 cm -> 70 / (1.75^2) = 22.86 -> 22.9 Normal weight
    res = NutritionEngine.calculate_bmi(70.0, 175.0)
    assert res["bmi"] == 22.9
    assert res["category"] == "Normal weight"

    # Edge cases
    assert NutritionEngine.calculate_bmi(0, 175)["bmi"] == 0.0

def test_bmr_mifflin_st_jeor():
    # Male: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
    bmr_male = NutritionEngine.calculate_bmr_mifflin_st_jeor(70.0, 175.0, 25, "male")
    assert round(bmr_male, 1) == 1673.8

    # Female: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 -> 1320.2
    bmr_female = NutritionEngine.calculate_bmr_mifflin_st_jeor(60.0, 165.0, 30, "female")
    assert round(bmr_female, 1) == 1320.2

def test_tdee_and_calorie_targets():
    # Moderate activity multiplier = 1.55
    targets = NutritionEngine.calculate_targets(
        weight_kg=70.0,
        height_cm=175.0,
        age=25,
        sex="male",
        activity_level="moderate",
        goal="lose_weight",
        preferred_rate=0.5
    )
    assert targets["bmr"] > 1600.0
    assert targets["tdee"] > 2400.0
    # Target should be in healthy deficit but >= 1400 kcal
    assert targets["daily_calorie_target"] < targets["tdee"]
    assert targets["daily_calorie_target"] >= 1400.0
    assert targets["protein_g"] > 100.0

def test_nutrient_item_calculation():
    # 150g cooked rice at 130 kcal/100g = 195.0 kcal
    calc = NutritionEngine.calculate_food_item_nutrition(
        calories_per_100g=130.0,
        protein_per_100g=2.7,
        carbs_per_100g=28.2,
        fat_per_100g=0.3,
        fiber_per_100g=0.4,
        quantity=150.0,
        unit="g"
    )
    assert calc["normalized_quantity_g"] == 150.0
    assert calc["calories"] == 195.0
    assert calc["protein_g"] == 4.0 or calc["protein_g"] == 4.1

def test_natural_language_food_parser():
    text = "I ate two medium rotis, one bowl of dal, 150 grams of cooked rice, and 120 grams of chicken curry"
    res = NaturalLanguageFoodParser.parse_text(text)
    items = res["detected_items"]
    assert len(items) == 4
    
    # Check roti
    roti = next(i for i in items if "roti" in i["food_name"].lower() or "roti" in i["unit"].lower())
    assert roti["quantity"] == 2.0
    assert roti["size_modifier"] == "medium"

    # Check rice
    rice = next(i for i in items if "rice" in i["food_name"].lower())
    assert rice["quantity"] == 150.0
    assert rice["unit"] in ["grams", "g"]
    assert rice["preparation_method"] == "cooked"
