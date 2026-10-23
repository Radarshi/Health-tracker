package com.nutritrack.android.ui.screens.meals

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.nutritrack.android.data.model.FoodItem
import com.nutritrack.android.data.model.MealItemCreate
import com.nutritrack.android.ui.theme.*

@Composable
fun AddMealDialog(
    viewModel: MealsViewModel,
    onDismiss: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedMealType by remember { mutableStateOf("lunch") }
    var searchQuery by remember { mutableStateOf("") }
    var selectedFood by remember { mutableStateOf<FoodItem?>(null) }
    var quantityText by remember { mutableStateOf("150") }

    // Custom food entry fallback
    var isCustomEntry by remember { mutableStateOf(false) }
    var customName by remember { mutableStateOf("") }
    var customCalories by remember { mutableStateOf("250") }
    var customProtein by remember { mutableStateOf("15") }
    var customCarbs by remember { mutableStateOf("30") }
    var customFat by remember { mutableStateOf("8") }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Slate900),
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.88f)
                .padding(vertical = 16.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Log Meal",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = Slate400)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Meal Type Selector Chips
                val mealTypes = listOf(
                    "breakfast" to "Breakfast",
                    "lunch" to "Lunch",
                    "dinner" to "Dinner",
                    "evening_snack" to "Snack"
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    mealTypes.forEach { (type, label) ->
                        val isSelected = selectedMealType == type
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) Emerald500 else Slate800)
                                .clickable { selectedMealType = type }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) Slate950 else Slate200
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Mode switcher (Catalog Search vs Custom Entry)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (isCustomEntry) "Custom Food" else "Catalog Search",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Emerald400
                    )
                    TextButton(onClick = { isCustomEntry = !isCustomEntry }) {
                        Text(
                            text = if (isCustomEntry) "Search Catalog" else "Custom Food",
                            fontSize = 12.sp,
                            color = Teal400
                        )
                    }
                }

                if (!isCustomEntry) {
                    // Search Bar
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = {
                            searchQuery = it
                            viewModel.searchFoods(it)
                        },
                        placeholder = { Text("Search (e.g. Rice, Dal, Roti, Chicken)...", fontSize = 13.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Emerald400) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Emerald500,
                            unfocusedBorderColor = Slate700,
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedContainerColor = Slate800,
                            unfocusedContainerColor = Slate800
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    // Selected Food or Search Results List
                    if (selectedFood != null) {
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = Emerald500.copy(alpha = 0.12f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = selectedFood!!.name,
                                        fontWeight = FontWeight.Bold,
                                        color = Emerald400,
                                        fontSize = 15.sp
                                    )
                                    Text(
                                        text = "${selectedFood!!.caloriesPer100g.toInt()} kcal/100g",
                                        color = Slate300,
                                        fontSize = 12.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Text(text = "Portion (g):", color = Slate200, fontSize = 13.sp)
                                    OutlinedTextField(
                                        value = quantityText,
                                        onValueChange = { quantityText = it },
                                        singleLine = true,
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            focusedBorderColor = Emerald500,
                                            unfocusedBorderColor = Slate700,
                                            focusedTextColor = Slate100,
                                            unfocusedTextColor = Slate100
                                        ),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.width(100.dp)
                                    )

                                    val q = quantityText.toDoubleOrNull() ?: 100.0
                                    val calcCal = (selectedFood!!.caloriesPer100g * q / 100.0).toInt()
                                    Text(text = "≈ $calcCal kcal", fontWeight = FontWeight.Bold, color = Emerald400)
                                }
                            }
                        }
                    } else {
                        // Search Results List
                        LazyColumn(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            if (uiState.searchResults.isEmpty() && searchQuery.isNotEmpty() && !uiState.isSearching) {
                                item {
                                    Text(
                                        text = "No catalog items found. Try switching to Custom Food.",
                                        color = Slate400,
                                        fontSize = 13.sp,
                                        modifier = Modifier.padding(vertical = 12.dp)
                                    )
                                }
                            }

                            items(uiState.searchResults) { food ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Slate800)
                                        .clickable {
                                            selectedFood = food
                                            quantityText = (food.servingSizeG?.toInt() ?: 100).toString()
                                        }
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = food.name, color = Slate100, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                                        Text(
                                            text = "P: ${food.proteinPer100g}g  C: ${food.carbsPer100g}g  F: ${food.fatPer100g}g",
                                            color = Slate400,
                                            fontSize = 11.sp
                                        )
                                    }
                                    Text(text = "${food.caloriesPer100g.toInt()} kcal", color = Emerald400, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                } else {
                    // Custom Entry Form
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = customName,
                            onValueChange = { customName = it },
                            label = { Text("Food Name") },
                            placeholder = { Text("e.g. Oatmeal with Almonds") },
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

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = customCalories,
                                onValueChange = { customCalories = it },
                                label = { Text("Calories (kcal)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
                            OutlinedTextField(
                                value = customProtein,
                                onValueChange = { customProtein = it },
                                label = { Text("Protein (g)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(
                                value = customCarbs,
                                onValueChange = { customCarbs = it },
                                label = { Text("Carbs (g)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
                            OutlinedTextField(
                                value = customFat,
                                onValueChange = { customFat = it },
                                label = { Text("Fat (g)") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
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
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Submit Button
                Button(
                    onClick = {
                        val items = mutableListOf<MealItemCreate>()
                        if (isCustomEntry) {
                            if (customName.isNotBlank()) {
                                items.add(
                                    MealItemCreate(
                                        foodNameSnapshot = customName.trim(),
                                        quantity = 1.0,
                                        unit = "serving",
                                        calories = customCalories.toDoubleOrNull() ?: 200.0,
                                        proteinG = customProtein.toDoubleOrNull() ?: 10.0,
                                        carbsG = customCarbs.toDoubleOrNull() ?: 20.0,
                                        fatG = customFat.toDoubleOrNull() ?: 5.0
                                    )
                                )
                                viewModel.logMeal(
                                    mealType = selectedMealType,
                                    name = customName.trim(),
                                    items = items,
                                    onSuccess = onDismiss
                                )
                            }
                        } else if (selectedFood != null) {
                            val q = quantityText.toDoubleOrNull() ?: 100.0
                            val ratio = q / 100.0
                            items.add(
                                MealItemCreate(
                                    foodId = selectedFood!!.id,
                                    foodNameSnapshot = selectedFood!!.name,
                                    quantity = q,
                                    unit = "g",
                                    calories = selectedFood!!.caloriesPer100g * ratio,
                                    proteinG = selectedFood!!.proteinPer100g * ratio,
                                    carbsG = selectedFood!!.carbsPer100g * ratio,
                                    fatG = selectedFood!!.fatPer100g * ratio,
                                    fiberG = (selectedFood!!.fiberPer100g ?: 0.0) * ratio
                                )
                            )
                            viewModel.logMeal(
                                mealType = selectedMealType,
                                name = selectedFood!!.name,
                                items = items,
                                onSuccess = onDismiss
                            )
                        }
                    },
                    enabled = (isCustomEntry && customName.isNotBlank()) || (!isCustomEntry && selectedFood != null),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Emerald500,
                        contentColor = Slate950
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text(text = "Save Meal Entry", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
