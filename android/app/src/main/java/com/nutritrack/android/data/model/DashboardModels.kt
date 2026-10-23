package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class DailyDashboardResponse(
    val date: String,
    val calories: CalorieSummary,
    val macros: MacrosSummary,
    val hydration: HydrationSummary,
    @SerializedName("meals_count") val mealsCount: Int,
    val meals: List<MealResponse> = emptyList()
)

data class CalorieSummary(
    val consumed: Double,
    val target: Double,
    val remaining: Double,
    val percent: Double
)

data class MacrosSummary(
    val protein: MacroItemSummary,
    val carbs: MacroItemSummary,
    val fat: MacroItemSummary,
    val fiber: MacroItemSummary?
)

data class MacroItemSummary(
    val consumed: Double,
    val target: Double,
    val percent: Double
)

data class HydrationSummary(
    @SerializedName("consumed_ml") val consumedMl: Double,
    @SerializedName("target_ml") val targetMl: Double,
    val percent: Double
)
