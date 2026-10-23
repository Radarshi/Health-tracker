package com.nutritrack.android.ui.screens.analytics

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nutritrack.android.data.model.HistoricalTrendsResponse
import com.nutritrack.android.data.model.WeightMeasurement
import com.nutritrack.android.data.repository.NutriTrackRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class AnalyticsUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val selectedDays: Int = 7,
    val trends: HistoricalTrendsResponse? = null,
    val weightHistory: List<WeightMeasurement> = emptyList()
)

class AnalyticsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NutriTrackRepository(application)
    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState: StateFlow<AnalyticsUiState> = _uiState

    init {
        loadData()
    }

    fun setDays(days: Int) {
        _uiState.value = _uiState.value.copy(selectedDays = days)
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            val trendsResult = repository.getCalorieAnalytics(_uiState.value.selectedDays)
            val weightResult = repository.getWeightAnalytics()

            trendsResult.onSuccess { t ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    trends = t,
                    weightHistory = weightResult.getOrDefault(emptyList())
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Failed to load analytics"
                )
            }
        }
    }
}
