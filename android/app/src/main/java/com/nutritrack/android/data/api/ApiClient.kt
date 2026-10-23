package com.nutritrack.android.data.api

import android.content.Context
import com.nutritrack.android.data.local.UserPreferences
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    @Volatile
    private var apiService: NutriTrackApiService? = null
    private var currentBaseUrl: String? = null

    fun getService(context: Context): NutriTrackApiService {
        val userPrefs = UserPreferences(context.applicationContext)
        val baseUrl = userPrefs.getBaseUrl()

        if (apiService == null || currentBaseUrl != baseUrl) {
            synchronized(this) {
                if (apiService == null || currentBaseUrl != baseUrl) {
                    val loggingInterceptor = HttpLoggingInterceptor().apply {
                        level = HttpLoggingInterceptor.Level.BODY
                    }

                    val okHttpClient = OkHttpClient.Builder()
                        .addInterceptor(AuthInterceptor(userPrefs))
                        .addInterceptor(loggingInterceptor)
                        .connectTimeout(30, TimeUnit.SECONDS)
                        .readTimeout(60, TimeUnit.SECONDS)
                        .writeTimeout(60, TimeUnit.SECONDS)
                        .build()

                    val retrofit = Retrofit.Builder()
                        .baseUrl(baseUrl)
                        .client(okHttpClient)
                        .addConverterFactory(GsonConverterFactory.create())
                        .build()

                    currentBaseUrl = baseUrl
                    apiService = retrofit.create(NutriTrackApiService::class.java)
                }
            }
        }
        return apiService!!
    }

    fun resetService() {
        synchronized(this) {
            apiService = null
            currentBaseUrl = null
        }
    }
}
