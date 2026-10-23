package com.nutritrack.android.ui.screens.profile

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nutritrack.android.data.model.UserProfile
import com.nutritrack.android.data.repository.NutriTrackRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class ProfileUiState(
    val isLoading: Boolean = true,
    val isSaving: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    val profile: UserProfile? = null,
    val userEmail: String = "",
    val userName: String = "",
    val serverUrl: String = ""
)

class ProfileViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NutriTrackRepository(application)
    private val _uiState = MutableStateFlow(
        ProfileUiState(
            userEmail = repository.preferences.getUserEmail() ?: "",
            userName = repository.preferences.getUserName() ?: "",
            serverUrl = repository.preferences.getBaseUrl()
        )
    )
    val uiState: StateFlow<ProfileUiState> = _uiState

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.getProfile()
            result.onSuccess { p ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    profile = p,
                    userEmail = repository.preferences.getUserEmail() ?: "",
                    userName = repository.preferences.getUserName() ?: ""
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Failed to load profile"
                )
            }
        }
    }

    fun updateProfile(
        weightKg: Double,
        heightCm: Double,
        age: Int,
        goal: String,
        activityLevel: String
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null, successMessage = null)
            val updated = UserProfile(
                currentWeightKg = weightKg,
                heightCm = heightCm,
                age = age,
                goal = goal,
                activityLevel = activityLevel
            )
            val result = repository.updateProfile(updated)
            result.onSuccess { p ->
                _uiState.value = _uiState.value.copy(
                    isSaving = false,
                    profile = p,
                    successMessage = "Profile & metabolic targets updated successfully!"
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isSaving = false,
                    error = err.localizedMessage ?: "Failed to update profile"
                )
            }
        }
    }

    fun updateServerUrl(url: String) {
        repository.preferences.setBaseUrl(url)
        _uiState.value = _uiState.value.copy(serverUrl = repository.preferences.getBaseUrl())
    }

    fun logout(onSuccess: () -> Unit) {
        repository.logout()
        onSuccess()
    }
}
