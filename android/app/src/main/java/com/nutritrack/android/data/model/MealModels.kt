package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class MealItemCreate(
    @SerializedName("food_id") val foodId: Int? = null,
    @SerializedName("food_name_snapshot") val foodNameSnapshot: String,
    val quantity: Double = 1.0,
    val unit: String = "g",
    @SerializedName("preparation_method") val preparationMethod: String? = "standard",
    val calories: Double? = null,
    @SerializedName("protein_g") val proteinG: Double? = null,
    @SerializedName("carbs_g") val carbsG: Double? = null,
    @SerializedName("fat_g") val fatG: Double? = null,
    @SerializedName("fiber_g") val fiberG: Double? = 0.0,
    @SerializedName("data_source") val dataSource: String? = "curated",
    @SerializedName("recognition_confidence") val recognitionConfidence: Double? = null,
    @SerializedName("image_url") val imageUrl: String? = null
)

data class MealCreate(
    @SerializedName("meal_type") val mealType: String, // breakfast, lunch, dinner, morning_snack, evening_snack
    val name: String? = null,
    val date: String? = null, // YYYY-MM-DD
    val time: String? = "12:00",
    val notes: String? = null,
    val items: List<MealItemCreate> = emptyList()
)

data class MealItemResponse(
    val id: Int,
    @SerializedName("meal_id") val mealId: Int? = null,
    @SerializedName("food_id") val foodId: Int? = null,
    @SerializedName("food_name_snapshot") val foodNameSnapshot: String,
    val quantity: Double,
    val unit: String,
    val calories: Double,
    @SerializedName("protein_g") val proteinG: Double,
    @SerializedName("carbs_g") val carbsG: Double,
    @SerializedName("fat_g") val fatG: Double,
    @SerializedName("fiber_g") val fiberG: Double? = 0.0,
    @SerializedName("image_url") val imageUrl: String? = null
)

data class MealResponse(
    val id: Int,
    @SerializedName("user_id") val userId: Int? = null,
    @SerializedName("meal_type") val mealType: String,
    val name: String?,
    val date: String,
    val time: String,
    val notes: String?,
    @SerializedName("total_calories") val totalCalories: Double,
    @SerializedName("total_protein_g") val totalProteinG: Double,
    @SerializedName("total_carbs_g") val totalCarbsG: Double,
    @SerializedName("total_fat_g") val totalFatG: Double,
    @SerializedName("total_fiber_g") val totalFiberG: Double,
    val items: List<MealItemResponse> = emptyList()
)
