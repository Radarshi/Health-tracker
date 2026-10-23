package com.nutritrack.android.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutritrack.android.ui.components.ErrorBanner
import com.nutritrack.android.ui.components.LoadingState
import com.nutritrack.android.ui.theme.*

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
    onLogout: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    var weightText by remember(uiState.profile) {
        mutableStateOf(uiState.profile?.currentWeightKg?.toString() ?: "72.0")
    }
    var heightText by remember(uiState.profile) {
        mutableStateOf(uiState.profile?.heightCm?.toString() ?: "175.0")
    }
    var ageText by remember(uiState.profile) {
        mutableStateOf(uiState.profile?.age?.toString() ?: "28")
    }
    var selectedGoal by remember(uiState.profile) {
        mutableStateOf(uiState.profile?.goal ?: "maintain")
    }
    var serverUrlText by remember { mutableStateOf(uiState.serverUrl) }

    if (uiState.isLoading && uiState.profile == null) {
        LoadingState()
        return
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Slate950)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "User Profile & Settings",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Slate100
        )
        Text(
            text = "Manage your biometric metrics and metabolic goals",
            fontSize = 13.sp,
            color = Slate400
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (uiState.error != null) {
            ErrorBanner(message = uiState.error!!)
            Spacer(modifier = Modifier.height(12.dp))
        }

        if (uiState.successMessage != null) {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = Emerald500.copy(alpha = 0.15f)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = uiState.successMessage!!,
                    color = Emerald400,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(12.dp)
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
        }

        // User Badge Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Emerald500.copy(alpha = 0.2f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        tint = Emerald400,
                        modifier = Modifier.size(28.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = uiState.userName.ifBlank { "NutriTrack Member" },
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    Text(
                        text = uiState.userEmail,
                        fontSize = 13.sp,
                        color = Slate400
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Biometrics Form Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Biometric Parameters",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Slate100
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = weightText,
                        onValueChange = { weightText = it },
                        label = { Text("Weight (kg)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Emerald500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    )

                    OutlinedTextField(
                        value = heightText,
                        onValueChange = { heightText = it },
                        label = { Text("Height (cm)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Emerald500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    )

                    OutlinedTextField(
                        value = ageText,
                        onValueChange = { ageText = it },
                        label = { Text("Age") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Emerald500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(0.8f)
                    )
                }

                Text(
                    text = "Nutrition Goal",
                    fontSize = 13.sp,
                    color = Slate300,
                    fontWeight = FontWeight.Medium
                )

                val goals = listOf(
                    "lose_weight" to "Fat Loss",
                    "maintain" to "Maintain",
                    "gain_muscle" to "Build Muscle"
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    goals.forEach { (goalKey, label) ->
                        val isSel = selectedGoal == goalKey
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSel) Emerald500 else Slate800)
                                .clickable { selectedGoal = goalKey }
                                .padding(vertical = 10.dp),
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

                Spacer(modifier = Modifier.height(4.dp))

                Button(
                    onClick = {
                        val w = weightText.toDoubleOrNull() ?: 70.0
                        val h = heightText.toDoubleOrNull() ?: 175.0
                        val a = ageText.toIntOrNull() ?: 28
                        viewModel.updateProfile(w, h, a, selectedGoal, "moderate")
                    },
                    enabled = !uiState.isSaving,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Emerald500,
                        contentColor = Slate950
                    ),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                ) {
                    if (uiState.isSaving) {
                        CircularProgressIndicator(color = Slate950, modifier = Modifier.size(20.dp))
                    } else {
                        Text("Recalculate & Save Targets", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Backend Server Host Setting Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Backend Server Connection",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Slate100
                )
                Text(
                    text = "Android emulator: http://10.0.2.2:8000/ \nPhysical device on Wi-Fi: http://192.168.x.x:8000/",
                    fontSize = 12.sp,
                    color = Slate400
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = serverUrlText,
                        onValueChange = { serverUrlText = it },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Emerald500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.weight(1f)
                    )

                    Button(
                        onClick = { viewModel.updateServerUrl(serverUrlText) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Slate800,
                            contentColor = Emerald400
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text("Save", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Logout Button
        OutlinedButton(
            onClick = { viewModel.logout(onLogout) },
            colors = ButtonDefaults.outlinedButtonColors(contentColor = ErrorRed),
            border = ButtonDefaults.outlinedButtonBorder.copy(
                brush = androidx.compose.ui.graphics.SolidColor(ErrorRed.copy(alpha = 0.5f))
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Icon(Icons.Default.ExitToApp, contentDescription = null, tint = ErrorRed, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out", fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}
