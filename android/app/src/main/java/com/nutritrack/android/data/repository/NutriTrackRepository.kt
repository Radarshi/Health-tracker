package com.nutritrack.android.data.repository

import android.content.Context
import com.nutritrack.android.data.api.ApiClient
import com.nutritrack.android.data.local.UserPreferences
import com.nutritrack.android.data.model.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class NutriTrackRepository(context: Context) {
    private val appContext = context.applicationContext
    private val apiService get() = ApiClient.getService(appContext)
    val preferences = UserPreferences(appContext)

    suspend fun login(email: String, pass: String): Result<TokenResponse> = runCatching {
        val resp = apiService.login(LoginRequest(email, pass))
        if (resp.isSuccessful && resp.body() != null) {
            val body = resp.body()!!
            preferences.saveAuthToken(body.accessToken)
            preferences.saveUserInfo(body.user.email, body.user.fullName)
            body
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Login failed (${resp.code()})")
        }
    }

    suspend fun register(email: String, pass: String, fullName: String?): Result<TokenResponse> = runCatching {
        val resp = apiService.register(RegisterRequest(email, pass, fullName))
        if (resp.isSuccessful && resp.body() != null) {
            val body = resp.body()!!
            preferences.saveAuthToken(body.accessToken)
            preferences.saveUserInfo(body.user.email, body.user.fullName)
            body
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Registration failed (${resp.code()})")
        }
    }

    suspend fun getDailyDashboard(date: String? = null): Result<DailyDashboardResponse> = runCatching {
        val resp = apiService.getDailyDashboard(date)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to load dashboard")
        }
    }

    suspend fun getMeals(date: String? = null): Result<List<MealResponse>> = runCatching {
        val resp = apiService.getMeals(date)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to load meals")
        }
    }

    suspend fun createMeal(meal: MealCreate): Result<MealResponse> = runCatching {
        val resp = apiService.createMeal(meal)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to log meal")
        }
    }

    suspend fun deleteMeal(mealId: Int): Result<Unit> = runCatching {
        val resp = apiService.deleteMeal(mealId)
        if (!resp.isSuccessful) {
            throw Exception(resp.errorBody()?.string() ?: "Failed to delete meal")
        }
    }

    suspend fun searchFoods(query: String): Result<List<FoodItem>> = runCatching {
        val resp = apiService.searchFoods(query)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Search failed")
        }
    }

    suspend fun logHydration(amountMl: Double): Result<HydrationResponse> = runCatching {
        val resp = apiService.logHydration(HydrationCreate(amountMl))
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to log water")
        }
    }

    suspend fun getProfile(): Result<UserProfile> = runCatching {
        val resp = apiService.getProfile()
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to load profile")
        }
    }

    suspend fun updateProfile(profile: UserProfile): Result<UserProfile> = runCatching {
        val resp = apiService.updateProfile(profile)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to update profile")
        }
    }

    suspend fun getCalorieAnalytics(days: Int = 7): Result<HistoricalTrendsResponse> = runCatching {
        val resp = apiService.getCalorieAnalytics(days)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to load calorie analytics")
        }
    }

    suspend fun getWeightAnalytics(): Result<List<WeightMeasurement>> = runCatching {
        val resp = apiService.getWeightAnalytics()
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "Failed to load weight analytics")
        }
    }

    suspend fun analyzeFoodImage(imageFile: File, notes: String? = null): Result<RecognitionResponse> = runCatching {
        val reqFile = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("file", imageFile.name, reqFile)
        val notesBody = notes?.toRequestBody("text/plain".toMediaTypeOrNull())

        val resp = apiService.analyzeFoodImage(body, notesBody)
        if (resp.isSuccessful && resp.body() != null) {
            resp.body()!!
        } else {
            throw Exception(resp.errorBody()?.string() ?: "AI recognition failed")
        }
    }

    fun logout() {
        preferences.clear()
        ApiClient.resetService()
    }
}
