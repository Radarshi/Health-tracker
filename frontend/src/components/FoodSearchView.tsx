import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, CheckCircle2, Globe, Database, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Food } from '../types';

interface FoodSearchViewProps {
  mealType: string;
  onSaveItems: (items: any[]) => void;
}

export const FoodSearchView: React.FC<FoodSearchViewProps> = ({
  mealType,
  onSaveItems,
}) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [portion, setPortion] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // New Custom Food Form State
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customP, setCustomP] = useState('');
  const [customC, setCustomC] = useState('');
  const [customF, setCustomF] = useState('');

  // Initial load with default staples
  useEffect(() => {
    handleSearch('rice');
  }, []);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const foods = await api.searchFoods(searchTerm);
      setResults(foods);
      if (foods.length > 0 && !selectedFood) {
        setSelectedFood(foods[0]);
        setPortion(foods[0].serving_size_g || 100);
      }
    } catch (e: any) {
      console.warn('Search error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setPortion(food.serving_size_g || 100);
    setUnit('g');
  };

  const calculatePreview = () => {
    if (!selectedFood) return { cal: 0, p: 0, c: 0, f: 0 };
    const factor = portion / 100.0;
    return {
      cal: Math.round(selectedFood.calories_per_100g * factor),
      p: Math.round(selectedFood.protein_per_100g * factor * 10) / 10,
      c: Math.round(selectedFood.carbs_per_100g * factor * 10) / 10,
      f: Math.round(selectedFood.fat_per_100g * factor * 10) / 10,
    };
  };

  const handleAddSelectedToMeal = () => {
    if (!selectedFood) return;
    const prev = calculatePreview();
    onSaveItems([
      {
        food_id: selectedFood.id,
        food_name_snapshot: selectedFood.name,
        quantity: portion,
        unit: unit,
        normalized_quantity_g: portion,
        calories: prev.cal,
        protein_g: prev.p,
        carbs_g: prev.c,
        fat_g: prev.f,
        data_source: selectedFood.data_source || 'database',
      },
    ]);
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newFood = await api.createCustomFood({
        name: customName,
        calories_per_100g: parseFloat(customCal) || 0,
        protein_per_100g: parseFloat(customP) || 0,
        carbs_per_100g: parseFloat(customC) || 0,
        fat_per_100g: parseFloat(customF) || 0,
        standard_serving_name: '100g',
        serving_size_g: 100,
        category: 'Custom',
      });
      setShowCustomModal(false);
      setSelectedFood(newFood);
      setResults([newFood, ...results]);
    } catch (err: any) {
      alert(`Error creating food: ${err.message}`);
    }
  };

  const preview = calculatePreview();

  return (
    <div className="space-y-5">
      {/* Search Input Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search staple food, brand, or USDA database..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 transition-colors focus:outline-none"
          />
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom Food
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Results List */}
        <div className="md:col-span-7 space-y-2 max-h-72 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Searching nutrition catalog...</div>
          ) : results.length > 0 ? (
            results.map((food, i) => (
              <div
                key={food.id || i}
                onClick={() => handleSelectFood(food)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  selectedFood?.name === food.name
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    {food.name}
                    {food.data_source === 'usda' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">
                        USDA
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {food.brand || food.category} • {Math.round(food.calories_per_100g)} kcal / 100g
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold">
                    {Math.round(food.protein_per_100g)}g P
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No food found. Click "+ Custom Food" to create one.
            </div>
          )}
        </div>

        {/* Selected Food & Portion Preview */}
        <div className="md:col-span-5 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          {selectedFood ? (
            <div>
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  Selected Item
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedFood.name}</h4>
                <p className="text-[11px] text-slate-400">
                  Standard serving: {selectedFood.standard_serving_name || '100g'}
                </p>
              </div>

              {/* Portion Selector */}
              <div className="space-y-2 my-3">
                <label className="text-xs text-slate-300 font-medium block">Quantity (grams):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={portion}
                    onChange={(e) => setPortion(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <span className="text-xs text-slate-400 font-medium">grams</span>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-1.5 pt-1">
                  {[50, 100, 150, 200, 300].map((g) => (
                    <button
                      key={g}
                      onClick={() => setPortion(g)}
                      className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                        portion === g
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {g}g
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculated nutrition box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Calories:</span>
                  <span className="text-base font-black text-white">{preview.cal} kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Protein</span>
                    <strong className="text-cyan-400">{preview.p}g</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Carbs</span>
                    <strong className="text-emerald-400">{preview.c}g</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fat</span>
                    <strong className="text-amber-400">{preview.f}g</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Select a food from the left list to adjust portion
            </div>
          )}

          {selectedFood && (
            <button
              onClick={handleAddSelectedToMeal}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Add to {mealType.replace('_', ' ').toUpperCase()}
            </button>
          )}
        </div>
      </div>

      {/* Modal for Custom Food */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Create Custom Food</h3>
            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Food Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Grandma's Lentil Soup"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Calories / 100g</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customCal}
                    onChange={(e) => setCustomCal(e.target.value)}
                    placeholder="120"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customP}
                    onChange={(e) => setCustomP(e.target.value)}
                    placeholder="8.5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customC}
                    onChange={(e) => setCustomC(e.target.value)}
                    placeholder="15.0"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Fat (g)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={customF}
                    onChange={(e) => setCustomF(e.target.value)}
                    placeholder="3.2"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Save Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
