from datetime import date, timedelta
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.all_models import Meal, MealItem, NutritionTarget, BodyMeasurement, HydrationEntry

class AnalyticsService:
    @classmethod
    def get_daily_summary(cls, db: Session, user_id: int, target_date: date) -> Dict[str, Any]:
        """
        Calculates daily intake vs targets for calories, macros, and hydration.
        """
        # Fetch targets
        target = db.query(NutritionTarget).filter(NutritionTarget.user_id == user_id).first()
        calorie_target = target.daily_calorie_target if target else 2000.0
        protein_target = target.protein_g if target else 130.0
        carbs_target = target.carbs_g if target else 220.0
        fat_target = target.fat_g if target else 65.0
        fiber_target = target.fiber_g if target else 30.0
        hydration_target = target.hydration_ml if target else 2500.0

        # Fetch meals for this day
        meals = db.query(Meal).filter(Meal.user_id == user_id, Meal.date == target_date).all()
        
        logged_calories = round(sum(m.total_calories for m in meals), 1)
        logged_protein = round(sum(m.total_protein_g for m in meals), 1)
        logged_carbs = round(sum(m.total_carbs_g for m in meals), 1)
        logged_fat = round(sum(m.total_fat_g for m in meals), 1)
        logged_fiber = round(sum(m.total_fiber_g for m in meals), 1)

        # Hydration
        hydrations = db.query(HydrationEntry).filter(
            HydrationEntry.user_id == user_id,
            HydrationEntry.date == target_date
        ).all()
        logged_hydration = round(sum(h.amount_ml for h in hydrations), 0)

        remaining_calories = round(calorie_target - logged_calories, 1)

        return {
            "date": target_date.isoformat(),
            "calories": {
                "consumed": logged_calories,
                "target": calorie_target,
                "remaining": remaining_calories,
                "percent": min(round((logged_calories / calorie_target) * 100, 1) if calorie_target > 0 else 0, 150.0),
            },
            "macros": {
                "protein": {
                    "consumed": logged_protein,
                    "target": protein_target,
                    "percent": min(round((logged_protein / protein_target) * 100, 1) if protein_target > 0 else 0, 150.0),
                },
                "carbs": {
                    "consumed": logged_carbs,
                    "target": carbs_target,
                    "percent": min(round((logged_carbs / carbs_target) * 100, 1) if carbs_target > 0 else 0, 150.0),
                },
                "fat": {
                    "consumed": logged_fat,
                    "target": fat_target,
                    "percent": min(round((logged_fat / fat_target) * 100, 1) if fat_target > 0 else 0, 150.0),
                },
                "fiber": {
                    "consumed": logged_fiber,
                    "target": fiber_target,
                    "percent": min(round((logged_fiber / fiber_target) * 100, 1) if fiber_target > 0 else 0, 150.0),
                }
            },
            "hydration": {
                "consumed_ml": logged_hydration,
                "target_ml": hydration_target,
                "percent": min(round((logged_hydration / hydration_target) * 100, 1) if hydration_target > 0 else 0, 150.0),
            },
            "meals_count": len(meals)
        }

    @classmethod
    def get_historical_trends(cls, db: Session, user_id: int, days: int = 7) -> Dict[str, Any]:
        """
        Historical calorie and macronutrient trend for charts.
        """
        target = db.query(NutritionTarget).filter(NutritionTarget.user_id == user_id).first()
        calorie_target = target.daily_calorie_target if target else 2000.0
        
        today = date.today()
        start_date = today - timedelta(days=days - 1)
        
        # Build date map
        trend_data = []
        for i in range(days):
            current_day = start_date + timedelta(days=i)
            meals = db.query(Meal).filter(Meal.user_id == user_id, Meal.date == current_day).all()
            
            day_cals = sum(m.total_calories for m in meals)
            day_protein = sum(m.total_protein_g for m in meals)
            day_carbs = sum(m.total_carbs_g for m in meals)
            day_fat = sum(m.total_fat_g for m in meals)

            trend_data.append({
                "date": current_day.strftime("%b %d"),
                "raw_date": current_day.isoformat(),
                "calories": round(day_cals, 1),
                "target_calories": calorie_target,
                "protein_g": round(day_protein, 1),
                "carbs_g": round(day_carbs, 1),
                "fat_g": round(day_fat, 1),
                "logged": len(meals) > 0
            })

        # Calculate averages
        logged_days = [d for d in trend_data if d["calories"] > 0]
        avg_calories = round(sum(d["calories"] for d in logged_days) / len(logged_days), 1) if logged_days else 0.0
        avg_protein = round(sum(d["protein_g"] for d in logged_days) / len(logged_days), 1) if logged_days else 0.0

        # Adherence calculation
        adherence_count = sum(1 for d in logged_days if abs(d["calories"] - calorie_target) <= 250)
        adherence_pct = round((adherence_count / len(logged_days)) * 100, 1) if logged_days else 0.0

        return {
            "days_count": days,
            "trends": trend_data,
            "average_calories": avg_calories,
            "average_protein_g": avg_protein,
            "adherence_rate_pct": adherence_pct,
            "logged_days_count": len(logged_days)
        }

    @classmethod
    def get_insights_and_recommendations(cls, db: Session, user_id: int) -> List[Dict[str, Any]]:
        """
        Generate transparent, evidence-backed nutritional insights.
        """
        trends = cls.get_historical_trends(db, user_id, days=7)
        target = db.query(NutritionTarget).filter(NutritionTarget.user_id == user_id).first()
        calorie_target = target.daily_calorie_target if target else 2000.0
        protein_target = target.protein_g if target else 130.0

        insights = []

        if trends["logged_days_count"] == 0:
            insights.append({
                "type": "info",
                "title": "Welcome to NutriTrack AI!",
                "message": "Start by logging your breakfast or a quick snack to see real-time calorie tracking and macro insights.",
                "data_point": "0 meals logged"
            })
            return insights

        # Protein consistency check
        if trends["average_protein_g"] < protein_target * 0.8:
            gap = round(protein_target - trends["average_protein_g"], 1)
            insights.append({
                "type": "suggestion",
                "title": "Increase Daily Protein Intake",
                "message": f"Your 7-day average protein is {trends['average_protein_g']}g, which is {gap}g below your target. Consider adding paneer, eggs, chicken, or lentils to your main meals.",
                "data_point": f"{trends['average_protein_g']}g vs {protein_target}g target"
            })
        else:
            insights.append({
                "type": "positive",
                "title": "Great Protein Consistency",
                "message": f"You're hitting your daily protein target with an average of {trends['average_protein_g']}g!",
                "data_point": f"Target {protein_target}g met"
            })

        # Calorie adherence check
        if trends["average_calories"] > calorie_target + 200:
            surplus = round(trends["average_calories"] - calorie_target, 0)
            insights.append({
                "type": "warning",
                "title": "Calorie Intake Trending Above Target",
                "message": f"Your average daily intake is {trends['average_calories']} kcal ({int(surplus)} kcal above target). Check evening snacks or portion sizes for cooked rice and breads.",
                "data_point": f"+{int(surplus)} kcal average surplus"
            })
        elif trends["average_calories"] < calorie_target - 400 and trends["average_calories"] > 0:
            deficit = round(calorie_target - trends["average_calories"], 0)
            insights.append({
                "type": "warning",
                "title": "Significant Calorie Deficit",
                "message": f"Your intake is {int(deficit)} kcal below target. Ensure you are getting adequate energy and nutrients for recovery.",
                "data_point": f"-{int(deficit)} kcal under target"
            })

        # Most frequent logged food
        frequent_foods = db.query(
            MealItem.food_name_snapshot,
            func.count(MealItem.id).label("cnt")
        ).join(Meal).filter(Meal.user_id == user_id).group_by(MealItem.food_name_snapshot).order_by(func.count(MealItem.id).desc()).limit(3).all()

        if frequent_foods:
            top_names = ", ".join([f"{f[0]} ({f[1]}x)" for f in frequent_foods])
            insights.append({
                "type": "info",
                "title": "Most Frequent Staples",
                "message": f"Your top recurring foods this week are: {top_names}.",
                "data_point": f"{frequent_foods[0][0]}"
            })

        return insights
