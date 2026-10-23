package com.nutritrack.android.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nutritrack.android.ui.theme.*

@Composable
fun CalorieGauge(
    consumed: Double,
    target: Double,
    size: Dp = 190.dp,
    strokeWidth: Dp = 16.dp,
    modifier: Modifier = Modifier
) {
    val remaining = target - consumed
    val percent = if (target > 0) ((consumed / target).toFloat()).coerceIn(0f, 1.5f) else 0f
    val animatedSweep by animateFloatAsState(
        targetValue = percent * 260f,
        animationSpec = tween(durationMillis = 1000),
        label = "gaugeSweep"
    )

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(size)
    ) {
        Canvas(modifier = Modifier.size(size - 16.dp)) {
            val strokePx = strokeWidth.toPx()
            val startAngle = 140f
            val totalSweep = 260f

            // Background track
            drawArc(
                color = Slate800,
                startAngle = startAngle,
                sweepAngle = totalSweep,
                useCenter = false,
                style = Stroke(width = strokePx, cap = StrokeCap.Round)
            )

            // Progress arc
            if (animatedSweep > 0) {
                drawArc(
                    brush = Brush.sweepGradient(
                        listOf(Emerald400, Teal400, Emerald500)
                    ),
                    startAngle = startAngle,
                    sweepAngle = animatedSweep.coerceAtMost(totalSweep),
                    useCenter = false,
                    style = Stroke(width = strokePx, cap = StrokeCap.Round)
                )
            }
        }

        // Center Info
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "${consumed.toInt()}",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Slate100
            )
            Text(
                text = "of ${target.toInt()} kcal",
                fontSize = 13.sp,
                color = Slate400
            )
            Spacer(modifier = Modifier.height(4.dp))
            val remainingLabel = if (remaining >= 0) "${remaining.toInt()} left" else "${(-remaining).toInt()} over"
            val remainingColor = if (remaining >= 0) Emerald400 else WarningOrange
            Text(
                text = remainingLabel,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = remainingColor
            )
        }
    }
}
