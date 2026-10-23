import {
  User, UserProfile, NutritionTarget, DailySummary,
  Meal, Food, Recipe, FoodRecognitionAnalysis, Insight
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('nutritrack_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMessage = 'An error occurred';
    try {
      const errData = await res.json();
      errMessage = errData.detail || errData.message || JSON.stringify(errData);
    } catch (_) {
      errMessage = `Request failed with status ${res.status}`;
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name?: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<User>('/auth/me'),

  // Profile & Targets
  getProfile: () => request<UserProfile>('/profile'),
  updateProfile: (data: Partial<UserProfile>) =>
    request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getTargets: () => request<NutritionTarget>('/profile/targets'),
  recalculateTargets: () => request<NutritionTarget>('/profile/recalculate-targets', { method: 'POST' }),
  addMeasurement: (data: { weight_kg: number; date?: string; notes?: string }) =>
    request<any>('/profile/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMeasurements: () => request<any[]>('/profile/measurements'),

  // Dashboard & Analytics
  getDailyDashboard: (date?: string) =>
    request<DailySummary>(`/dashboard/daily${date ? `?dashboard_date=${date}` : ''}`),
  getCalorieAnalytics: (days = 7) => request<any>(`/analytics/calories?days=${days}`),
  getWeightAnalytics: () => request<any[]>('/analytics/weight'),
  getInsights: () => request<Insight[]>('/insights'),
  getWeeklyReport: () => request<any>('/reports/weekly'),

  // Foods
  searchFoods: (q: string, includeUsda = true) =>
    request<Food[]>(`/foods/search?q=${encodeURIComponent(q)}&include_usda=${includeUsda}`),
  getFavorites: () => request<Food[]>('/foods/favorites'),
  toggleFavorite: (foodId: number) =>
    request<any>(`/foods/favorites/${foodId}`, { method: 'POST' }),
  createCustomFood: (food: Partial<Food>) =>
    request<Food>('/foods/custom', {
      method: 'POST',
      body: JSON.stringify(food),
    }),
  parseNaturalLanguageFood: (text: string) =>
    request<{
      original_text: string;
      detected_items: any[];
      has_ambiguity: boolean;
      clarification_questions: string[];
    }>('/foods/parse-text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  // Meals
  getMeals: (date?: string) =>
    request<Meal[]>(`/meals${date ? `?meal_date=${date}` : ''}`),
  createMeal: (meal: any) =>
    request<Meal>('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }),
  updateMeal: (id: number, meal: any) =>
    request<Meal>(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    }),
  deleteMeal: (id: number) =>
    request<any>(`/meals/${id}`, { method: 'DELETE' }),
  duplicateMeal: (id: number, target_date?: string) =>
    request<Meal>(`/meals/${id}/duplicate${target_date ? `?target_date=${target_date}` : ''}`, {
      method: 'POST',
    }),

  // Recipes
  getRecipes: () => request<Recipe[]>('/recipes'),
  createRecipe: (recipe: any) =>
    request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }),
  deleteRecipe: (id: number) =>
    request<any>(`/recipes/${id}`, { method: 'DELETE' }),

  // Hydration
  logWater: (amount_ml: number, date?: string) =>
    request<any>('/hydration', {
      method: 'POST',
      body: JSON.stringify({ amount_ml, date }),
    }),

  // Barcode
  lookupBarcode: (barcode: string) =>
    request<any>(`/products/barcode/${barcode}`),

  // Recognition
  analyzeImage: async (file: File, notes?: string): Promise<FoodRecognitionAnalysis> => {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) formData.append('notes', notes);

    const res = await fetch(`${API_BASE}/food-recognition/analyze`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Photo analysis failed');
    }

    return res.json();
  },

  // Settings & Data Management
  getNotificationPreferences: () => request<any>('/notifications/preferences'),
  updateNotificationPreferences: (data: any) =>
    request<any>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  exportData: () => request<any>('/export'),
  deleteAccount: () => request<any>('/account', { method: 'DELETE' }),
};
