package com.nutritrack.android.data.api

import com.nutritrack.android.data.local.UserPreferences
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val userPreferences: UserPreferences) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val token = userPreferences.getAuthToken()

        val newRequestBuilder = originalRequest.newBuilder()
        if (!token.isNullOrEmpty()) {
            newRequestBuilder.addHeader("Authorization", "Bearer $token")
        }

        return chain.proceed(newRequestBuilder.build())
    }
}
