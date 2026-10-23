package com.nutritrack.android.data.model

import com.google.gson.annotations.SerializedName

data class RecognitionResponse(
    @SerializedName("image_url") val imageUrl: String?,
    @SerializedName("job_id") val jobId: String?,
    val status: String,
    @SerializedName("segments_count") val segmentsCount: Int,
    @SerializedName("detected_regions") val detectedRegions: List<DetectedRegion>,
    val disclaimer: String?
)

data class DetectedRegion(
    @SerializedName("region_id") val regionId: String,
    val label: String,
    val confidence: Double,
    val bbox: BoundingBox?,
    val candidates: List<RegionCandidate> = emptyList(),
    @SerializedName("suggested_portion") var suggestedPortion: Double,
    @SerializedName("suggested_unit") var suggestedUnit: String,
    @SerializedName("nutrients_preview") val nutrientsPreview: NutrientsPreview?,
    @SerializedName("requires_user_confirmation") val requiresUserConfirmation: Boolean = true
)

data class BoundingBox(
    val x: Double,
    val y: Double,
    val width: Double,
    val height: Double
)

data class RegionCandidate(
    val name: String,
    val confidence: Double
)

data class NutrientsPreview(
    val calories: Double,
    @SerializedName("protein_g") val proteinG: Double,
    @SerializedName("carbs_g") val carbsG: Double,
    @SerializedName("fat_g") val fatG: Double
)
