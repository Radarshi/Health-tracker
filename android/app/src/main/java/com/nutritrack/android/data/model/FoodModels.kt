package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class FoodItem(
    val id: Int,
    val name: String,
    val brand: String? = null,
    val category: String? = "General",
    @SerializedName("standard_serving_name") val standardServingName: String? = "100g",
    @SerializedName("serving_size_g") val servingSizeG: Double? = 100.0,
    @SerializedName("calories_per_100g") val caloriesPer100g: Double,
    @SerializedName("protein_per_100g") val proteinPer100g: Double,
    @SerializedName("carbs_per_100g") val carbsPer100g: Double,
    @SerializedName("fat_per_100g") val fatPer100g: Double,
    @SerializedName("fiber_per_100g") val fiberPer100g: Double? = 0.0,
    @SerializedName("data_source") val dataSource: String? = "custom",
    @SerializedName("is_custom") val isCustom: Boolean? = false
)
