package com.nutritrack.android.ui.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutritrack.android.ui.components.ErrorBanner
import com.nutritrack.android.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: AuthViewModel,
    onLoginSuccess: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("demo@nutritrack.ai") }
    var password by remember { mutableStateOf("demopassword") }
    var showServerConfig by remember { mutableStateOf(false) }
    var serverUrlInput by remember { mutableStateOf(uiState.serverUrl) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        // App Logo / Badge
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(
                    Brush.linearGradient(listOf(Emerald500, Teal400))
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "NT",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Slate950
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "NutriTrack AI",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Slate100
        )
        Text(
            text = "Intelligent Nutrition & Calorie Tracking",
            fontSize = 14.sp,
            color = Slate400
        )

        Spacer(modifier = Modifier.height(32.dp))

        if (uiState.error != null) {
            ErrorBanner(message = uiState.error!!)
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Email Field
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email Address") },
            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = Emerald400) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Emerald500,
                unfocusedBorderColor = Slate700,
                focusedLabelColor = Emerald400,
                unfocusedLabelColor = Slate400,
                focusedTextColor = Slate100,
                unfocusedTextColor = Slate100,
                focusedContainerColor = Slate900,
                unfocusedContainerColor = Slate900
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Password Field
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Emerald400) },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Emerald500,
                unfocusedBorderColor = Slate700,
                focusedLabelColor = Emerald400,
                unfocusedLabelColor = Slate400,
                focusedTextColor = Slate100,
                unfocusedTextColor = Slate100,
                focusedContainerColor = Slate900,
                unfocusedContainerColor = Slate900
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Sign In Button
        Button(
            onClick = { viewModel.login(email, password, onLoginSuccess) },
            enabled = !uiState.isLoading,
            colors = ButtonDefaults.buttonColors(
                containerColor = Emerald500,
                contentColor = Slate950
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(color = Slate950, modifier = Modifier.size(24.dp))
            } else {
                Text(text = "Sign In", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // One-tap Demo fill button
        OutlinedButton(
            onClick = {
                email = "demo@nutritrack.ai"
                password = "demopassword"
                viewModel.login("demo@nutritrack.ai", "demopassword", onLoginSuccess)
            },
            colors = ButtonDefaults.outlinedButtonColors(contentColor = Teal400),
            border = ButtonDefaults.outlinedButtonBorder.copy(brush = Brush.horizontalGradient(listOf(Emerald500, Teal400))),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Text(text = "One-Tap Demo Login", fontWeight = FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Register link
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(text = "Don't have an account? ", color = Slate400, fontSize = 14.sp)
            Text(
                text = "Sign Up",
                color = Emerald400,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onNavigateToRegister() }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Server URL Configuration Toggle
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.clickable { showServerConfig = !showServerConfig }
        ) {
            Icon(Icons.Default.Settings, contentDescription = null, tint = Slate600, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = if (showServerConfig) "Hide Server Settings" else "Backend Server: ${uiState.serverUrl}",
                color = Slate400,
                fontSize = 12.sp
            )
        }

        if (showServerConfig) {
            Spacer(modifier = Modifier.height(12.dp))
            OutlinedTextField(
                value = serverUrlInput,
                onValueChange = { serverUrlInput = it },
                label = { Text("API Base URL") },
                placeholder = { Text("http://10.0.2.2:8000/") },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Emerald500,
                    unfocusedBorderColor = Slate700,
                    focusedTextColor = Slate100,
                    unfocusedTextColor = Slate100
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(6.dp))
            Button(
                onClick = {
                    viewModel.updateServerUrl(serverUrlInput)
                    showServerConfig = false
                },
                colors = ButtonDefaults.buttonColors(containerColor = Slate800, contentColor = Emerald400),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Save Server URL", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
