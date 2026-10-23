package com.nutritrack.android.ui.screens.dashboard

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nutritrack.android.data.model.DailyDashboardResponse
import com.nutritrack.android.data.repository.NutriTrackRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val summary: DailyDashboardResponse? = null,
    val userName: String = "Member"
)

class DashboardViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NutriTrackRepository(application)
    private val _uiState = MutableStateFlow(
        DashboardUiState(userName = repository.preferences.getUserName() ?: "Member")
    )
    val uiState: StateFlow<DashboardUiState> = _uiState

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val result = repository.getDailyDashboard()
            result.onSuccess { data ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    summary = data,
                    userName = repository.preferences.getUserName() ?: "Member"
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Failed to load dashboard"
                )
            }
        }
    }

    fun addWater(amountMl: Double) {
        viewModelScope.launch {
            val result = repository.logHydration(amountMl)
            result.onSuccess {
                loadDashboard()
            }
        }
    }

    fun deleteMeal(mealId: Int) {
        viewModelScope.launch {
            val result = repository.deleteMeal(mealId)
            result.onSuccess {
                loadDashboard()
            }
        }
    }
}
