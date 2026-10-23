package com.nutritrack.android.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.nutritrack.android.ui.screens.analytics.AnalyticsScreen
import com.nutritrack.android.ui.screens.analytics.AnalyticsViewModel
import com.nutritrack.android.ui.screens.auth.AuthViewModel
import com.nutritrack.android.ui.screens.auth.LoginScreen
import com.nutritrack.android.ui.screens.auth.RegisterScreen
import com.nutritrack.android.ui.screens.dashboard.DashboardScreen
import com.nutritrack.android.ui.screens.dashboard.DashboardViewModel
import com.nutritrack.android.ui.screens.meals.MealsScreen
import com.nutritrack.android.ui.screens.meals.MealsViewModel
import com.nutritrack.android.ui.screens.profile.ProfileScreen
import com.nutritrack.android.ui.screens.profile.ProfileViewModel
import com.nutritrack.android.ui.screens.scan.ScanScreen
import com.nutritrack.android.ui.screens.scan.ScanViewModel
import com.nutritrack.android.ui.theme.*

@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = viewModel()
    val startDestination = if (authViewModel.isLoggedIn()) Screen.Dashboard.route else Screen.Login.route

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val isBottomBarVisible = currentRoute in Screen.bottomNavItems.map { it.route }

    Scaffold(
        bottomBar = {
            if (isBottomBarVisible) {
                NavigationBar(
                    containerColor = Slate900,
                    tonalElevation = 8.dp
                ) {
                    Screen.bottomNavItems.forEach { screen ->
                        val selected = currentRoute == screen.route
                        NavigationBarItem(
                            icon = {
                                if (screen.icon != null) {
                                    Icon(screen.icon, contentDescription = screen.title)
                                }
                            },
                            label = {
                                Text(
                                    text = screen.title,
                                    fontSize = 11.sp,
                                    color = if (selected) Emerald400 else Slate400
                                )
                            },
                            selected = selected,
                            onClick = {
                                navController.navigate(screen.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = Emerald400,
                                unselectedIconColor = Slate400,
                                indicatorColor = Slate800
                            )
                        )
                    }
                }
            }
        },
        containerColor = Slate950
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Auth routes
            composable(Screen.Login.route) {
                LoginScreen(
                    viewModel = authViewModel,
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateToRegister = {
                        navController.navigate(Screen.Register.route)
                    }
                )
            }

            composable(Screen.Register.route) {
                RegisterScreen(
                    viewModel = authViewModel,
                    onRegisterSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    },
                    onNavigateToLogin = {
                        navController.popBackStack()
                    }
                )
            }

            // Main Tabs
            composable(Screen.Dashboard.route) {
                val dashboardViewModel: DashboardViewModel = viewModel()
                DashboardScreen(
                    viewModel = dashboardViewModel,
                    onNavigateToAddMeal = {
                        navController.navigate(Screen.Meals.route)
                    }
                )
            }

            composable(Screen.Meals.route) {
                val mealsViewModel: MealsViewModel = viewModel()
                MealsScreen(viewModel = mealsViewModel)
            }

            composable(Screen.Scan.route) {
                val scanViewModel: ScanViewModel = viewModel()
                ScanScreen(
                    viewModel = scanViewModel,
                    onMealSaved = {
                        navController.navigate(Screen.Dashboard.route)
                    }
                )
            }

            composable(Screen.Analytics.route) {
                val analyticsViewModel: AnalyticsViewModel = viewModel()
                AnalyticsScreen(viewModel = analyticsViewModel)
            }

            composable(Screen.Profile.route) {
                val profileViewModel: ProfileViewModel = viewModel()
                ProfileScreen(
                    viewModel = profileViewModel,
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
