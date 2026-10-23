import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DailySummaryCard } from './components/DailySummaryCard';
import { MealSection } from './components/MealSection';
import { AnalyticsChartsView } from './components/AnalyticsChartsView';
import { FoodLoggingModal } from './components/FoodLoggingModal';
import { RecipeBuilderModal } from './components/RecipeBuilderModal';
import { BarcodeModal } from './components/BarcodeModal';
import { WeightTrackerModal } from './components/WeightTrackerModal';
import { WeeklyReportModal } from './components/WeeklyReportModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { api } from './services/api';
import { DailySummary, Insight, Recipe } from './types';
import { Sparkles, RefreshCw } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals state
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedMealTypeForAdd, setSelectedMealTypeForAdd] = useState('lunch');
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isWeightOpen, setIsWeightOpen] = useState(false);
  const [isWeeklyReportOpen, setIsWeeklyReportOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentDate, user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, insRes] = await Promise.all([
        api.getDailyDashboard(currentDate),
        api.getInsights(),
      ]);
      setSummary(sumRes);
      setInsights(insRes);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWater = async (amount: number) => {
    try {
      await api.logWater(amount, currentDate);
      await loadDashboardData();
    } catch (e: any) {
      alert(`Hydration error: ${e.message}`);
    }
  };

  const handleOpenAddFoodToMeal = (mealType: string) => {
    setSelectedMealTypeForAdd(mealType);
    setIsAddFoodOpen(true);
  };

  const handleDeleteMeal = async (mealId: number) => {
    try {
      await api.deleteMeal(mealId);
      await loadDashboardData();
    } catch (e: any) {
      alert(`Failed to delete meal: ${e.message}`);
    }
  };

  const handleDuplicateMeal = async (mealId: number) => {
    try {
      await api.duplicateMeal(mealId, currentDate);
      await loadDashboardData();
    } catch (e: any) {
      alert(`Failed to duplicate meal: ${e.message}`);
    }
  };

  const handleLogRecipeToMeal = async (recipe: Recipe) => {
    try {
      await api.createMeal({
        meal_type: 'lunch',
        name: recipe.name,
        date: currentDate,
        items: [
          {
            food_name_snapshot: `${recipe.name} (1 serving)`,
            quantity: 1,
            unit: 'serving',
            calories: recipe.calories_per_serving,
            protein_g: recipe.protein_per_serving,
            carbs_g: recipe.carbs_per_serving,
            fat_g: recipe.fat_per_serving,
            fiber_g: recipe.fiber_per_serving,
          },
        ],
      });
      setIsRecipesOpen(false);
      await loadDashboardData();
    } catch (e: any) {
      alert(`Error logging recipe: ${e.message}`);
    }
  };

  const handleLogBarcodeProduct = async (productItem: any) => {
    try {
      await api.createMeal({
        meal_type: 'lunch',
        name: 'Packaged Food Scan',
        date: currentDate,
        items: [productItem],
      });
      await loadDashboardData();
    } catch (e: any) {
      alert(`Error logging product: ${e.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onOpenAddFood={() => handleOpenAddFoodToMeal('lunch')}
        onOpenBarcode={() => setIsBarcodeOpen(true)}
        onOpenRecipes={() => setIsRecipesOpen(true)}
        onOpenWeight={() => setIsWeightOpen(true)}
        onOpenWeeklyReport={() => setIsWeeklyReportOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        calorieSummary={
          summary
            ? { consumed: summary.calories.consumed, target: summary.calories.target }
            : undefined
        }
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoading && !summary ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Synchronizing NutriTrack AI Engine...</p>
          </div>
        ) : summary ? (
          <>
            {/* Daily Summary Card */}
            <DailySummaryCard
              summary={summary}
              onLogWater={handleLogWater}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />

            {/* Meals Section */}
            <MealSection
              meals={summary.meals || []}
              onAddFoodToMeal={handleOpenAddFoodToMeal}
              onDeleteMeal={handleDeleteMeal}
              onDuplicateMeal={handleDuplicateMeal}
            />

            {/* Nutrition Trends & Charts Section */}
            <AnalyticsChartsView insights={insights} />
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 NutriTrack AI — Intelligent Nutrition & Calorie Tracking Platform</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>FoodSAM AI Segmentation</span>
            <span>•</span>
            <span>USDA FoodData Central</span>
            <span>•</span>
            <span>Open Food Facts</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FoodLoggingModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        defaultMealType={selectedMealTypeForAdd}
        currentDate={currentDate}
        onSuccess={loadDashboardData}
      />

      <RecipeBuilderModal
        isOpen={isRecipesOpen}
        onClose={() => setIsRecipesOpen(false)}
        onLogRecipeToMeal={handleLogRecipeToMeal}
      />

      <BarcodeModal
        isOpen={isBarcodeOpen}
        onClose={() => setIsBarcodeOpen(false)}
        onLogProductToMeal={handleLogBarcodeProduct}
      />

      <WeightTrackerModal
        isOpen={isWeightOpen}
        onClose={() => setIsWeightOpen(false)}
        onSuccess={loadDashboardData}
      />

      <WeeklyReportModal
        isOpen={isWeeklyReportOpen}
        onClose={() => setIsWeeklyReportOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSuccess={loadDashboardData}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
