package com.nutritrack.android.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutritrack.android.ui.theme.*

@Composable
fun MacroItem(
    name: String,
    consumed: Double,
    target: Double,
    unit: String = "g",
    color: Color,
    modifier: Modifier = Modifier
) {
    val progress = if (target > 0) ((consumed / target).toFloat()).coerceIn(0f, 1f) else 0f
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = 800),
        label = "macroProgress"
    )

    Column(modifier = modifier) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = name,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Slate200
            )
            Text(
                text = "${consumed.toInt()}/${target.toInt()}$unit",
                fontSize = 12.sp,
                color = Slate400
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(Slate800)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(animatedProgress)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(4.dp))
                    .background(color)
            )
        }
    }
}

@Composable
fun MacroGrid(
    proteinConsumed: Double,
    proteinTarget: Double,
    carbsConsumed: Double,
    carbsTarget: Double,
    fatConsumed: Double,
    fatTarget: Double,
    fiberConsumed: Double = 0.0,
    fiberTarget: Double = 30.0,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Slate900)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Macronutrient Breakdown",
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold,
            color = Slate100
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            MacroItem(
                name = "Protein",
                consumed = proteinConsumed,
                target = proteinTarget,
                color = ProteinColor,
                modifier = Modifier.weight(1f)
            )
            MacroItem(
                name = "Carbs",
                consumed = carbsConsumed,
                target = carbsTarget,
                color = CarbsColor,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            MacroItem(
                name = "Fat",
                consumed = fatConsumed,
                target = fatTarget,
                color = FatColor,
                modifier = Modifier.weight(1f)
            )
            MacroItem(
                name = "Fiber",
                consumed = fiberConsumed,
                target = fiberTarget,
                color = FiberColor,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
