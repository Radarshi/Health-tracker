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
import androidx.compose.material.icons.filled.Person
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

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onRegisterSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var fullName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

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
            text = "Create Account",
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold,
            color = Slate100
        )
        Text(
            text = "Start your intelligent nutrition journey",
            fontSize = 14.sp,
            color = Slate400
        )

        Spacer(modifier = Modifier.height(32.dp))

        if (uiState.error != null) {
            ErrorBanner(message = uiState.error!!)
            Spacer(modifier = Modifier.height(16.dp))
        }

        // Full Name Field
        OutlinedTextField(
            value = fullName,
            onValueChange = { fullName = it },
            label = { Text("Full Name") },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Emerald400) },
            singleLine = true,
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
            label = { Text("Password (min 6 chars)") },
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

        // Sign Up Button
        Button(
            onClick = { viewModel.register(email, password, fullName, onRegisterSuccess) },
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
                Text(text = "Create Account", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Sign In Link
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(text = "Already have an account? ", color = Slate400, fontSize = 14.sp)
            Text(
                text = "Sign In",
                color = Emerald400,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.clickable { onNavigateToLogin() }
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
