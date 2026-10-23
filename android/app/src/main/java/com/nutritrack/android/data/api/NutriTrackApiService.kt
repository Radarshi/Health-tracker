package com.nutritrack.android.data.api

import com.nutritrack.android.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface NutriTrackApiService {

    // Authentication
    @POST("api/v1/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<TokenResponse>

    @POST("api/v1/auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<TokenResponse>

    // Dashboard & Metrics
    @GET("api/v1/dashboard/daily")
    suspend fun getDailyDashboard(
        @Query("dashboard_date") date: String? = null
    ): Response<DailyDashboardResponse>

    // Meals
    @GET("api/v1/meals")
    suspend fun getMeals(
        @Query("meal_date") date: String? = null
    ): Response<List<MealResponse>>

    @POST("api/v1/meals")
    suspend fun createMeal(@Body meal: MealCreate): Response<MealResponse>

    @DELETE("api/v1/meals/{meal_id}")
    suspend fun deleteMeal(@Path("meal_id") mealId: Int): Response<Map<String, Any>>

    // Food Database & Search
    @GET("api/v1/foods/search")
    suspend fun searchFoods(
        @Query("q") query: String,
        @Query("include_usda") includeUsda: Boolean = true
    ): Response<List<FoodItem>>

    // Hydration
    @POST("api/v1/hydration")
    suspend fun logHydration(@Body hydration: HydrationCreate): Response<HydrationResponse>

    // User Profile
    @GET("api/v1/profile")
    suspend fun getProfile(): Response<UserProfile>

    @PUT("api/v1/profile")
    suspend fun updateProfile(@Body profile: UserProfile): Response<UserProfile>

    // Analytics
    @GET("api/v1/analytics/calories")
    suspend fun getCalorieAnalytics(
        @Query("days") days: Int = 7
    ): Response<HistoricalTrendsResponse>

    @GET("api/v1/analytics/weight")
    suspend fun getWeightAnalytics(): Response<List<WeightMeasurement>>

    // AI Food Recognition & Segmentation
    @Multipart
    @POST("api/v1/food-recognition/analyze")
    suspend fun analyzeFoodImage(
        @Part file: MultipartBody.Part,
        @Part("notes") notes: RequestBody? = null
    ): Response<RecognitionResponse>
}
