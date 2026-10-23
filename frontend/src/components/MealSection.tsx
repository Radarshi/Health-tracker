import React from 'react';
import { 
  Sun, Sunset, Moon, Coffee, Cookie, Plus, 
  Trash2, Copy, Edit3, Utensils
} from 'lucide-react';
import { Meal } from '../types';

interface MealSectionProps {
  meals: Meal[];
  onAddFoodToMeal: (mealType: string) => void;
  onDeleteMeal: (mealId: number) => void;
  onDuplicateMeal: (mealId: number) => void;
}

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: Sun, time: '08:00 AM' },
  { key: 'morning_snack', label: 'Mid-Morning Snack', icon: Coffee, time: '11:00 AM' },
  { key: 'lunch', label: 'Lunch', icon: Utensils, time: '01:00 PM' },
  { key: 'evening_snack', label: 'Evening Snack', icon: Cookie, time: '05:00 PM' },
  { key: 'dinner', label: 'Dinner', icon: Moon, time: '08:00 PM' },
  { key: 'custom', label: 'Custom Meal', icon: Sunset, time: 'Flexible' },
];

export const MealSection: React.FC<MealSectionProps> = ({
  meals,
  onAddFoodToMeal,
  onDeleteMeal,
  onDuplicateMeal,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-400" />
          Today's Meals
        </h2>
        <span className="text-xs text-slate-400">
          {meals.length} {meals.length === 1 ? 'meal' : 'meals'} logged
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEAL_TYPES.map(({ key, label, icon: Icon, time }) => {
          const loggedMeals = meals.filter((m) => m.meal_type === key);
          const totalCalories = loggedMeals.reduce((acc, m) => acc + m.total_calories, 0);
          const totalProtein = loggedMeals.reduce((acc, m) => acc + m.total_protein_g, 0);

          return (
            <div
              key={key}
              className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{label}</h3>
                      <p className="text-[11px] text-slate-400">{time}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-white">
                      {Math.round(totalCalories)}{' '}
                      <span className="text-xs font-normal text-slate-400">kcal</span>
                    </span>
                    {totalProtein > 0 && (
                      <p className="text-[10px] text-cyan-400 font-medium">
                        {Math.round(totalProtein)}g protein
                      </p>
                    )}
                  </div>
                </div>

                {/* Items List */}
                {loggedMeals.length > 0 ? (
                  <div className="space-y-2 my-3">
                    {loggedMeals.map((meal) => (
                      <div key={meal.id} className="space-y-1.5">
                        {meal.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50"
                          >
                            <div className="truncate pr-2">
                              <span className="text-slate-200 font-medium">
                                {item.food_name_snapshot}
                              </span>
                              <span className="text-slate-500 text-[11px] ml-1.5">
                                ({item.quantity} {item.unit})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-right flex-shrink-0">
                              <span className="text-slate-300 font-semibold">
                                {Math.round(item.calories)} kcal
                              </span>
                            </div>
                          </div>
                        ))}

                        {/* Meal actions */}
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            onClick={() => onDuplicateMeal(meal.id)}
                            title="Duplicate this meal"
                            className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                          <button
                            onClick={() => onDeleteMeal(meal.id)}
                            title="Delete this meal"
                            className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No items logged yet
                  </div>
                )}
              </div>

              {/* Add Food Button */}
              <button
                onClick={() => onAddFoodToMeal(key)}
                className="w-full mt-2 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to {label}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
