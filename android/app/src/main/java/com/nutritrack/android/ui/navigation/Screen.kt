package com.nutritrack.android.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Login : Screen("login", "Login")
    object Register : Screen("register", "Register")

    // Bottom Navigation items
    object Dashboard : Screen("dashboard", "Today", Icons.Default.Home)
    object Meals : Screen("meals", "Meals", Icons.Default.Restaurant)
    object Scan : Screen("scan", "AI Scan", Icons.Default.CameraAlt)
    object Analytics : Screen("analytics", "Analytics", Icons.Default.BarChart)
    object Profile : Screen("profile", "Profile", Icons.Default.Person)

    companion object {
        val bottomNavItems = listOf(Dashboard, Meals, Scan, Analytics, Profile)
    }
}
