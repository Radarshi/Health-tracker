package com.nutritrack.android.ui.screens.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.nutritrack.android.ui.components.*
import com.nutritrack.android.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    onNavigateToAddMeal: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val todayFormatted = remember {
        SimpleDateFormat("EEEE, MMM d", Locale.getDefault()).format(Date())
    }

    if (uiState.isLoading && uiState.summary == null) {
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
        // Top Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Welcome back, ${uiState.userName}",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
                Text(
                    text = todayFormatted,
                    fontSize = 13.sp,
                    color = Slate400
                )
            }

            IconButton(
                onClick = { viewModel.loadDashboard() },
                colors = IconButtonDefaults.iconButtonColors(contentColor = Emerald400)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh")
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        if (uiState.error != null) {
            ErrorBanner(
                message = uiState.error!!,
                onRetry = { viewModel.loadDashboard() }
            )
            Spacer(modifier = Modifier.height(16.dp))
        }

        val summary = uiState.summary
        if (summary != null) {
            // Calorie Gauge Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Calories Consumed",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate100
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    CalorieGauge(
                        consumed = summary.calories.consumed,
                        target = summary.calories.target
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Macro Grid
            MacroGrid(
                proteinConsumed = summary.macros.protein.consumed,
                proteinTarget = summary.macros.protein.target,
                carbsConsumed = summary.macros.carbs.consumed,
                carbsTarget = summary.macros.carbs.target,
                fatConsumed = summary.macros.fat.consumed,
                fatTarget = summary.macros.fat.target,
                fiberConsumed = summary.macros.fiber?.consumed ?: 0.0,
                fiberTarget = summary.macros.fiber?.target ?: 30.0
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Water Tracker Card
            WaterTrackerCard(
                consumedMl = summary.hydration.consumedMl,
                targetMl = summary.hydration.targetMl,
                onAddWater = { viewModel.addWater(it) }
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Today's Meals Section Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Today's Meals (${summary.meals.size})",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
                TextButton(
                    onClick = onNavigateToAddMeal,
                    colors = ButtonDefaults.textButtonColors(contentColor = Emerald400)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Meal", fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            if (summary.meals.isEmpty()) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No meals logged yet today.\nTap '+ Add Meal' to get started!",
                            color = Slate400,
                            fontSize = 14.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    summary.meals.forEach { meal ->
                        MealCard(
                            meal = meal,
                            onDelete = { viewModel.deleteMeal(it) }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(80.dp)) // padding for bottom nav
    }
}
