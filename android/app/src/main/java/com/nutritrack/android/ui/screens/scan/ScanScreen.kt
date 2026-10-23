package com.nutritrack.android.ui.screens.scan

import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.nutritrack.android.ui.components.ErrorBanner
import com.nutritrack.android.ui.components.LoadingState
import com.nutritrack.android.ui.theme.*

@Composable
fun ScanScreen(
    viewModel: ScanViewModel,
    onMealSaved: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    var selectedMealType by remember { mutableStateOf("lunch") }

    // Camera Launcher
    val cameraLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.TakePicturePreview()
    ) { bitmap: Bitmap? ->
        if (bitmap != null) {
            viewModel.analyzeBitmap(bitmap)
        }
    }

    // Gallery Picker Launcher
    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            if (Build.VERSION.SDK_INT < 28) {
                @Suppress("DEPRECATION")
                val bitmap = MediaStore.Images.Media.getBitmap(context.contentResolver, uri)
                viewModel.analyzeBitmap(bitmap)
            } else {
                val source = ImageDecoder.createSource(context.contentResolver, uri)
                val bitmap = ImageDecoder.decodeBitmap(source)
                viewModel.analyzeBitmap(bitmap)
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "AI Food Recognition",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
                Text(
                    text = "FoodSAM regional segmentation & portion confirmation",
                    fontSize = 12.sp,
                    color = Slate400
                )
            }

            if (uiState.recognitionResult != null) {
                IconButton(onClick = { viewModel.reset() }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = Slate400)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (uiState.error != null) {
            ErrorBanner(message = uiState.error!!)
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Image capture / selection card
        if (uiState.previewBitmap == null && uiState.recognitionResult == null) {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(28.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(Emerald500.copy(alpha = 0.15f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CameraAlt,
                            contentDescription = null,
                            tint = Emerald400,
                            modifier = Modifier.size(32.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Snap or Upload Your Meal",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    Text(
                        text = "Detects multiple items (rice, dal, curries, rotis) with candidate alternatives and portion confirmation.",
                        fontSize = 13.sp,
                        color = Slate400,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = { cameraLauncher.launch(null) },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Emerald500,
                                contentColor = Slate950
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.CameraAlt, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Camera", fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = { galleryLauncher.launch("image/*") },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Teal400),
                            border = ButtonDefaults.outlinedButtonBorder.copy(
                                brush = androidx.compose.ui.graphics.SolidColor(Teal400)
                            ),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Gallery", fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        } else {
            // Preview Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Slate900),
                contentAlignment = Alignment.Center
            ) {
                if (uiState.previewBitmap != null) {
                    Image(
                        bitmap = uiState.previewBitmap!!.asImageBitmap(),
                        contentDescription = "Meal preview",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
                if (uiState.isAnalyzing) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Slate950.copy(alpha = 0.65f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = Emerald500)
                            Spacer(modifier = Modifier.height(8.dp))
                            Text("Segmenting food regions with FoodSAM...", color = Slate100, fontSize = 13.sp)
                        }
                    }
                }
            }
        }

        // Recognition Results
        if (uiState.detectedRegions.isNotEmpty()) {
            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Detected Regions (${uiState.detectedRegions.size})",
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Slate100
            )

            Text(
                text = "Confirm or adjust portion sizes before saving to log.",
                fontSize = 12.sp,
                color = Slate400
            )

            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                uiState.detectedRegions.forEach { region ->
                    Card(
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate900),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = region.label,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Slate100,
                                    modifier = Modifier.weight(1f)
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Emerald500.copy(alpha = 0.2f))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = "${(region.confidence * 100).toInt()}% match",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Emerald400
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(8.dp))

                            // Portion adjuster
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    FilledTonalIconButton(
                                        onClick = {
                                            val current = region.suggestedPortion
                                            if (current > 10) {
                                                viewModel.updateRegionPortion(region.regionId, current - 25)
                                            }
                                        },
                                        colors = IconButtonDefaults.filledTonalIconButtonColors(
                                            containerColor = Slate800,
                                            contentColor = Slate100
                                        ),
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Text("-", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                    }

                                    Text(
                                        text = "${region.suggestedPortion.toInt()} ${region.suggestedUnit}",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate100
                                    )

                                    FilledTonalIconButton(
                                        onClick = {
                                            val current = region.suggestedPortion
                                            viewModel.updateRegionPortion(region.regionId, current + 25)
                                        },
                                        colors = IconButtonDefaults.filledTonalIconButtonColors(
                                            containerColor = Slate800,
                                            contentColor = Slate100
                                        ),
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Text("+", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                    }
                                }

                                if (region.nutrientsPreview != null) {
                                    Text(
                                        text = "≈ ${region.nutrientsPreview.calories.toInt()} kcal",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Emerald400
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Meal Type Selector
            Text(text = "Assign to Meal:", color = Slate300, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("breakfast" to "Breakfast", "lunch" to "Lunch", "dinner" to "Dinner", "evening_snack" to "Snack").forEach { (type, label) ->
                    val isSel = selectedMealType == type
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSel) Emerald500 else Slate800)
                            .clickable { selectedMealType = type }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSel) Slate950 else Slate200
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Save Meal Button
            Button(
                onClick = { viewModel.logRecognizedMeal(selectedMealType, onMealSaved) },
                enabled = !uiState.isSaving,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Emerald500,
                    contentColor = Slate950
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            ) {
                if (uiState.isSaving) {
                    CircularProgressIndicator(color = Slate950, modifier = Modifier.size(24.dp))
                } else {
                    Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Confirm & Save Meal", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}
