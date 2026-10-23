package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class HydrationCreate(
    @SerializedName("amount_ml") val amountMl: Double,
    val date: String? = null
)

data class HydrationResponse(
    val id: Int,
    @SerializedName("amount_ml") val amountMl: Double,
    val date: String,
    @SerializedName("logged_at") val loggedAt: String
)
