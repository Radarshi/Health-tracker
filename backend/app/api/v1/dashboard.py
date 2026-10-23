from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional, Dict, Any, List
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.all_models import User, Meal, BodyMeasurement
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["Dashboard & Analytics"])

@router.get("/dashboard/daily")
def get_daily_dashboard(
    dashboard_date: Optional[date] = Query(None, description="Date (YYYY-MM-DD) for dashboard view"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_date = dashboard_date or date.today()
    summary = AnalyticsService.get_daily_summary(db, current_user.id, target_date)
    
    # Also fetch all meals for this day
    meals = db.query(Meal).filter(
        Meal.user_id == current_user.id,
        Meal.date == target_date
    ).order_by(Meal.time.asc()).all()

    summary["meals"] = [
        {
            "id": m.id,
            "meal_type": m.meal_type,
            "name": m.name,
            "time": m.time,
            "total_calories": m.total_calories,
            "total_protein_g": m.total_protein_g,
            "total_carbs_g": m.total_carbs_g,
            "total_fat_g": m.total_fat_g,
            "total_fiber_g": m.total_fiber_g,
            "items_count": len(m.items),
            "items": [
                {
                    "id": itm.id,
                    "food_name": itm.food_name_snapshot,
                    "quantity": itm.quantity,
                    "unit": itm.unit,
                    "calories": itm.calories,
                    "protein_g": itm.protein_g,
                    "carbs_g": itm.carbs_g,
                    "fat_g": itm.fat_g,
                    "image_url": itm.image_url
                }
                for itm in m.items
            ]
        }
        for m in meals
    ]

    return summary

@router.get("/analytics/calories")
def get_calorie_analytics(
    days: int = Query(7, ge=3, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_historical_trends(db, current_user.id, days=days)

@router.get("/analytics/weight")
def get_weight_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    measurements = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    ).order_by(BodyMeasurement.date.asc()).all()

    return [
        {
            "date": m.date.isoformat(),
            "display_date": m.date.strftime("%b %d"),
            "weight_kg": m.weight_kg,
            "bmi": m.bmi,
            "notes": m.notes
        }
        for m in measurements
    ]

@router.get("/reports/weekly")
def get_weekly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trends = AnalyticsService.get_historical_trends(db, current_user.id, days=7)
    insights = AnalyticsService.get_insights_and_recommendations(db, current_user.id)
    
    return {
        "user_name": current_user.full_name or "NutriTrack Member",
        "generated_date": date.today().isoformat(),
        "period": f"{(date.today() - timedelta(days=6)).strftime('%b %d')} - {date.today().strftime('%b %d, %Y')}",
        "summary": {
            "avg_calories": trends["average_calories"],
            "avg_protein_g": trends["average_protein_g"],
            "adherence_rate": f"{trends['adherence_rate_pct']}%",
            "logged_days": f"{trends['logged_days_count']} of 7 days"
        },
        "trends": trends["trends"],
        "insights": insights
    }

@router.get("/insights")
def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_insights_and_recommendations(db, current_user.id)
