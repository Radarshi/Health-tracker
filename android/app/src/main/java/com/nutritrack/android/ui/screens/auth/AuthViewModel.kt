package com.nutritrack.android.ui.screens.auth

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nutritrack.android.data.repository.NutriTrackRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false,
    val serverUrl: String = ""
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NutriTrackRepository(application)
    private val _uiState = MutableStateFlow(AuthUiState(serverUrl = repository.preferences.getBaseUrl()))
    val uiState: StateFlow<AuthUiState> = _uiState

    fun isLoggedIn(): Boolean {
        return !repository.preferences.getAuthToken().isNullOrEmpty()
    }

    fun updateServerUrl(url: String) {
        repository.preferences.setBaseUrl(url)
        _uiState.value = _uiState.value.copy(serverUrl = repository.preferences.getBaseUrl())
    }

    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please fill in all fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.login(email.trim(), pass)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
                onSuccess()
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Invalid credentials or cannot connect to server"
                )
            }
        }
    }

    fun register(email: String, pass: String, fullName: String, onSuccess: () -> Unit) {
        if (email.isBlank() || pass.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please fill in all fields")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.register(email.trim(), pass, fullName.ifBlank { null })
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
                onSuccess()
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Registration failed"
                )
            }
        }
    }
}
