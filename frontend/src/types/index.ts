export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  age?: number;
  sex?: string;
  height_cm?: number;
  current_weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: string;
  goal?: string;
  preferred_rate?: number;
  dietary_preferences?: string;
  allergies?: string;
  health_notes?: string;
  preferred_units?: string;
  created_at?: string;
}

export interface NutritionTarget {
  id: number;
  user_id: number;
  bmr: number;
  tdee: number;
  daily_calorie_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  hydration_ml: number;
}

export interface Food {
  id: number;
  name: string;
  brand?: string;
  category?: string;
  standard_serving_name?: string;
  serving_size_g?: number;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  data_source?: string;
  barcode?: string;
  is_custom?: boolean;
}

export interface MealItem {
  id: number;
  meal_id: number;
  food_id?: number;
  food_name_snapshot: string;
  quantity: number;
  unit: string;
  normalized_quantity_g: number;
  preparation_method?: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  recognition_confidence?: number;
  image_url?: string;
}

export interface Meal {
  id: number;
  user_id: number;
  meal_type: string;
  name?: string;
  date: string;
  time: string;
  notes?: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  items: MealItem[];
}

export interface DailySummary {
  date: string;
  calories: {
    consumed: number;
    target: number;
    remaining: number;
    percent: number;
  };
  macros: {
    protein: { consumed: number; target: number; percent: number };
    carbs: { consumed: number; target: number; percent: number };
    fat: { consumed: number; target: number; percent: number };
    fiber: { consumed: number; target: number; percent: number };
  };
  hydration: {
    consumed_ml: number;
    target_ml: number;
    percent: number;
  };
  meals_count: number;
  meals: any[];
}

export interface TrendDay {
  date: string;
  raw_date: string;
  calories: number;
  target_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged: boolean;
}

export interface Insight {
  type: "positive" | "warning" | "suggestion" | "info";
  title: string;
  message: string;
  data_point?: string;
}

export interface RecipeItem {
  id?: number;
  food_id?: number;
  food_name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export interface Recipe {
  id: number;
  name: string;
  description?: string;
  servings: number;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  calories_per_serving: number;
  protein_per_serving: number;
  carbs_per_serving: number;
  fat_per_serving: number;
  fiber_per_serving: number;
  items: RecipeItem[];
}

export interface FoodCandidate {
  name: string;
  confidence: number;
}

export interface DetectedFoodRegion {
  region_id: string;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  candidates: FoodCandidate[];
  suggested_portion: number;
  suggested_unit: string;
  nutrients_preview: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  requires_user_confirmation: boolean;
}

export interface FoodRecognitionAnalysis {
  image_url: string;
  dimensions: { width: number; height: number };
  status: string;
  segments_count: number;
  detected_regions: DetectedFoodRegion[];
  disclaimer: string;
  job_id?: string;
}
