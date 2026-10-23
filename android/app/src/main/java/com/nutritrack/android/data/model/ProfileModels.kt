package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class UserProfile(
    val id: Int? = null,
    @SerializedName("user_id") val userId: Int? = null,
    val age: Int? = null,
    val sex: String? = "male",
    @SerializedName("height_cm") val heightCm: Double? = null,
    @SerializedName("current_weight_kg") val currentWeightKg: Double? = null,
    @SerializedName("target_weight_kg") val targetWeightKg: Double? = null,
    @SerializedName("activity_level") val activityLevel: String? = "moderate",
    val goal: String? = "maintain",
    @SerializedName("preferred_rate") val preferredRate: Double? = 0.5,
    @SerializedName("dietary_preferences") val dietaryPreferences: String? = "none"
)

data class NutritionTarget(
    val id: Int? = null,
    val bmr: Double = 0.0,
    val tdee: Double = 0.0,
    @SerializedName("daily_calorie_target") val dailyCalorieTarget: Double = 2000.0,
    @SerializedName("protein_g") val proteinG: Double = 140.0,
    @SerializedName("carbs_g") val carbsG: Double = 220.0,
    @SerializedName("fat_g") val fatG: Double = 60.0,
    @SerializedName("fiber_g") val fiberG: Double = 28.0,
    @SerializedName("hydration_ml") val hydrationMl: Double = 2500.0
)

data class WeightMeasurement(
    val date: String,
    @SerializedName("display_date") val displayDate: String? = null,
    @SerializedName("weight_kg") val weightKg: Double,
    val bmi: Double? = null,
    val notes: String? = null
)

data class CalorieTrendItem(
    val date: String,
    @SerializedName("display_date") val displayDate: String? = null,
    @SerializedName("total_calories") val totalCalories: Double,
    @SerializedName("target_calories") val targetCalories: Double,
    @SerializedName("protein_g") val proteinG: Double,
    @SerializedName("carbs_g") val carbsG: Double,
    @SerializedName("fat_g") val fatG: Double
)

data class HistoricalTrendsResponse(
    @SerializedName("daily_trends") val dailyTrends: List<CalorieTrendItem> = emptyList(),
    @SerializedName("average_calories") val averageCalories: Double = 0.0,
    @SerializedName("adherence_rate") val adherenceRate: Double = 0.0
)
