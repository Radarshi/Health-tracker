package com.nutritrack.android.ui.screens.scan

import android.app.Application
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.nutritrack.android.data.model.*
import com.nutritrack.android.data.repository.NutriTrackRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

data class ScanUiState(
    val isAnalyzing: Boolean = false,
    val isSaving: Boolean = false,
    val error: String? = null,
    val recognitionResult: RecognitionResponse? = null,
    val previewBitmap: Bitmap? = null,
    val detectedRegions: List<DetectedRegion> = emptyList()
)

class ScanViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = NutriTrackRepository(application)
    private val _uiState = MutableStateFlow(ScanUiState())
    val uiState: StateFlow<ScanUiState> = _uiState

    fun analyzeBitmap(bitmap: Bitmap, notes: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isAnalyzing = true,
                error = null,
                previewBitmap = bitmap
            )

            val tempFile = withContext(Dispatchers.IO) {
                val file = File(getApplication<Application>().cacheDir, "scan_${System.currentTimeMillis()}.jpg")
                FileOutputStream(file).use { out ->
                    bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
                }
                file
            }

            val result = repository.analyzeFoodImage(tempFile, notes)
            result.onSuccess { resp ->
                _uiState.value = _uiState.value.copy(
                    isAnalyzing = false,
                    recognitionResult = resp,
                    detectedRegions = resp.detectedRegions
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isAnalyzing = false,
                    error = err.localizedMessage ?: "Failed to analyze image"
                )
            }
        }
    }

    fun analyzeUri(uri: Uri, context: Context, notes: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isAnalyzing = true, error = null)
            val tempFile = withContext(Dispatchers.IO) {
                val file = File(context.cacheDir, "scan_${System.currentTimeMillis()}.jpg")
                context.contentResolver.openInputStream(uri)?.use { input ->
                    FileOutputStream(file).use { output ->
                        input.copyTo(output)
                    }
                }
                file
            }

            val result = repository.analyzeFoodImage(tempFile, notes)
            result.onSuccess { resp ->
                _uiState.value = _uiState.value.copy(
                    isAnalyzing = false,
                    recognitionResult = resp,
                    detectedRegions = resp.detectedRegions
                )
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isAnalyzing = false,
                    error = err.localizedMessage ?: "Failed to analyze image"
                )
            }
        }
    }

    fun updateRegionPortion(regionId: String, newPortion: Double) {
        val updated = _uiState.value.detectedRegions.map { reg ->
            if (reg.regionId == regionId) {
                reg.copy(suggestedPortion = newPortion)
            } else {
                reg
            }
        }
        _uiState.value = _uiState.value.copy(detectedRegions = updated)
    }

    fun logRecognizedMeal(mealType: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true)
            val items = _uiState.value.detectedRegions.map { reg ->
                val ratio = if (reg.suggestedPortion > 0) reg.suggestedPortion / 100.0 else 1.0
                val preview = reg.nutrientsPreview
                MealItemCreate(
                    foodNameSnapshot = reg.label,
                    quantity = reg.suggestedPortion,
                    unit = reg.suggestedUnit,
                    calories = preview?.calories ?: 150.0,
                    proteinG = preview?.proteinG ?: 5.0,
                    carbsG = preview?.carbsG ?: 20.0,
                    fatG = preview?.fatG ?: 3.0,
                    recognitionConfidence = reg.confidence,
                    imageUrl = _uiState.value.recognitionResult?.imageUrl
                )
            }

            val mealCreate = MealCreate(
                mealType = mealType,
                name = "AI Scanned Meal",
                items = items
            )

            val result = repository.createMeal(mealCreate)
            result.onSuccess {
                _uiState.value = ScanUiState() // reset
                onSuccess()
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isSaving = false,
                    error = err.localizedMessage ?: "Failed to save scanned meal"
                )
            }
        }
    }

    fun reset() {
        _uiState.value = ScanUiState()
    }
}
