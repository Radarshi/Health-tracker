package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    @SerializedName("full_name") val fullName: String?
)

data class TokenResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String = "bearer",
    val user: UserInfo
)

data class UserInfo(
    val id: Int,
    val email: String,
    @SerializedName("full_name") val fullName: String?
)
