package com.nutritrack.android.ui.screens.analytics

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutritrack.android.ui.components.ErrorBanner
import com.nutritrack.android.ui.components.LoadingState
import com.nutritrack.android.ui.theme.*

@Composable
fun AnalyticsScreen(
    viewModel: AnalyticsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isLoading && uiState.trends == null) {
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
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Nutrition Analytics",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
                Text(
                    text = "Historical trends & adherence metrics",
                    fontSize = 13.sp,
                    color = Slate400
                )
            }

            IconButton(
                onClick = { viewModel.loadData() },
                colors = IconButtonDefaults.iconButtonColors(contentColor = Emerald400)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (uiState.error != null) {
            ErrorBanner(
                message = uiState.error!!,
                onRetry = { viewModel.loadData() }
            )
            Spacer(modifier = Modifier.height(12.dp))
        }

        // Timeframe selector (7, 14, 30 days)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf(7 to "7 Days", 14 to "14 Days", 30 to "30 Days").forEach { (days, label) ->
                val isSel = uiState.selectedDays == days
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isSel) Emerald500 else Slate900)
                        .clickable { viewModel.setDays(days) }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        fontSize = 13.sp,
                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSel) Slate950 else Slate300
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Summary Metric Cards
        val trends = uiState.trends
        if (trends != null) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Average Intake", color = Slate400, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${trends.averageCalories.toInt()} kcal",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Emerald400
                        )
                        Text(text = "per day", color = Slate400, fontSize = 11.sp)
                    }
                }

                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = "Goal Adherence", color = Slate400, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${(trends.adherenceRate * 100).toInt()}%",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Teal400
                        )
                        Text(text = "within ±10% target", color = Slate400, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Daily Calorie Chart Card
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Daily Calorie Progression",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Slate100
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    if (trends.dailyTrends.isEmpty()) {
                        Text("No historical data logged yet.", color = Slate400, fontSize = 13.sp)
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            trends.dailyTrends.forEach { day ->
                                val percent = if (day.targetCalories > 0) {
                                    ((day.totalCalories / day.targetCalories).toFloat()).coerceIn(0f, 1.3f)
                                } else 0f

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = day.displayDate ?: day.date.takeLast(5),
                                        fontSize = 11.sp,
                                        color = Slate400,
                                        modifier = Modifier.width(50.dp)
                                    )

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(14.dp)
                                            .clip(RoundedCornerShape(7.dp))
                                            .background(Slate800)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(percent.coerceAtMost(1f))
                                                .fillMaxHeight()
                                                .clip(RoundedCornerShape(7.dp))
                                                .background(
                                                    if (percent > 1.05f) WarningOrange else Emerald500
                                                )
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "${day.totalCalories.toInt()}",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Slate200,
                                        modifier = Modifier.width(42.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Weight Tracking Card
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Body Weight & BMI History",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Slate100
                )
                Spacer(modifier = Modifier.height(10.dp))

                if (uiState.weightHistory.isEmpty()) {
                    Text(
                        text = "No weight measurements recorded yet.",
                        color = Slate400,
                        fontSize = 13.sp
                    )
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        uiState.weightHistory.takeLast(5).reversed().forEach { w ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = w.displayDate ?: w.date,
                                    fontSize = 13.sp,
                                    color = Slate300
                                )
                                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(
                                        text = "${w.weightKg} kg",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Slate100
                                    )
                                    if (w.bmi != null) {
                                        Text(
                                            text = "BMI ${String.format("%.1f", w.bmi)}",
                                            fontSize = 12.sp,
                                            color = Emerald400
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(80.dp))
    }
}
