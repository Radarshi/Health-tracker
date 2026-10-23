package com.nutritrack.android.ui.screens.meals

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutritrack.android.ui.components.ErrorBanner
import com.nutritrack.android.ui.components.LoadingState
import com.nutritrack.android.ui.components.MealCard
import com.nutritrack.android.ui.theme.*

@Composable
fun MealsScreen(
    viewModel: MealsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = Emerald500,
                contentColor = Slate950,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.padding(bottom = 70.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Meal")
            }
        },
        containerColor = Slate950
    ) { paddingValues ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(paddingValues)
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
                        text = "Meal History",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    Text(
                        text = "Detailed nutrition breakdown per meal",
                        fontSize = 13.sp,
                        color = Slate400
                    )
                }

                IconButton(
                    onClick = { viewModel.loadMeals() },
                    colors = IconButtonDefaults.iconButtonColors(contentColor = Emerald400)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (uiState.error != null) {
                ErrorBanner(
                    message = uiState.error!!,
                    onRetry = { viewModel.loadMeals() }
                )
                Spacer(modifier = Modifier.height(12.dp))
            }

            if (uiState.isLoading && uiState.meals.isEmpty()) {
                LoadingState()
            } else if (uiState.meals.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No meals logged for this date.\nTap the + button to add one!",
                        color = Slate400,
                        fontSize = 15.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 90.dp)
                ) {
                    items(uiState.meals) { meal ->
                        MealCard(
                            meal = meal,
                            onDelete = { viewModel.deleteMeal(it) }
                        )
                    }
                }
            }
        }
    }

    if (showAddDialog) {
        AddMealDialog(
            viewModel = viewModel,
            onDismiss = { showAddDialog = false }
        )
    }
}
