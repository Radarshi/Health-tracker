package com.nutritrack.android.ui.screens.meals

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nutritrack.android.data.model.*
import com.nutritrack.android.data.repository.NutriTrackRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

data class MealsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val meals: List<MealResponse> = emptyList(),
    val searchResults: List<FoodItem> = emptyList(),
    val isSearching: Boolean = false,
    val selectedDate: String = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
)

class MealsViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NutriTrackRepository(application)
    private val _uiState = MutableStateFlow(MealsUiState())
    val uiState: StateFlow<MealsUiState> = _uiState

    init {
        loadMeals()
    }

    fun loadMeals(date: String = _uiState.value.selectedDate) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, selectedDate = date)
            val result = repository.getMeals(date)
            result.onSuccess { list ->
                _uiState.value = _uiState.value.copy(isLoading = false, meals = list)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Failed to load meals"
                )
            }
        }
    }

    fun searchFoods(query: String) {
        if (query.isBlank()) {
            _uiState.value = _uiState.value.copy(searchResults = emptyList(), isSearching = false)
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSearching = true)
            val result = repository.searchFoods(query)
            result.onSuccess { list ->
                _uiState.value = _uiState.value.copy(searchResults = list, isSearching = false)
            }.onFailure {
                _uiState.value = _uiState.value.copy(isSearching = false)
            }
        }
    }

    fun logMeal(
        mealType: String,
        name: String,
        items: List<MealItemCreate>,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val mealCreate = MealCreate(
                mealType = mealType,
                name = name.ifBlank { null },
                date = _uiState.value.selectedDate,
                items = items
            )
            val result = repository.createMeal(mealCreate)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false)
                loadMeals()
                onSuccess()
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.localizedMessage ?: "Failed to create meal"
                )
            }
        }
    }

    fun deleteMeal(mealId: Int) {
        viewModelScope.launch {
            val result = repository.deleteMeal(mealId)
            result.onSuccess {
                loadMeals()
            }
        }
    }
}
