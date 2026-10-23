import React, { useState, useEffect } from 'react';
import { X, BookOpen, Plus, Trash2, CheckCircle2, Utensils } from 'lucide-react';
import { api } from '../services/api';
import { Recipe } from '../types';

interface RecipeBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogRecipeToMeal: (recipe: Recipe) => void;
}

export const RecipeBuilderModal: React.FC<RecipeBuilderModalProps> = ({
  isOpen,
  onClose,
  onLogRecipeToMeal,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<
    Array<{ food_name: string; quantity: number; unit: string }>
  >([
    { food_name: 'Cooked White Rice (Basmati / Sona Masoori)', quantity: 200, unit: 'g' },
    { food_name: 'Yellow Dal Tadka (Cooked Toor / Moong)', quantity: 200, unit: 'g' },
  ]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) loadRecipes();
  }, [isOpen]);

  const loadRecipes = async () => {
    try {
      const recs = await api.getRecipes();
      setSavedRecipes(recs);
    } catch (e) {
      console.warn('Failed to load recipes:', e);
    }
  };

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { food_name: '', quantity: 100, unit: 'g' }]);
  };

  const handleRemoveIngredient = (idx: number) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleIngredientChange = (idx: number, field: string, val: any) => {
    setIngredients(
      ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: val } : ing))
    );
  };

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim() || ingredients.length === 0) return;
    setIsSaving(true);
    try {
      await api.createRecipe({
        name: recipeName,
        description,
        servings: Number(servings) || 1,
        items: ingredients.filter((ing) => ing.food_name.trim() !== ''),
      });
      await loadRecipes();
      setActiveTab('saved');
      setRecipeName('');
      setDescription('');
    } catch (err: any) {
      alert(`Error creating recipe: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecipe = async (id: number) => {
    try {
      await api.deleteRecipe(id);
      setSavedRecipes(savedRecipes.filter((r) => r.id !== id));
    } catch (e: any) {
      alert(`Failed to delete recipe: ${e.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Recipe Builder</h3>
              <p className="text-xs text-slate-400">
                Combine ingredients & calculate nutrition per serving
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex gap-3 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'create'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Create New Recipe
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'saved'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Saved Recipes ({savedRecipes.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs text-slate-300 block mb-1">Recipe Name</label>
                  <input
                    type="text"
                    required
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="e.g. Healthy Bengali Fish Curry & Rice"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Number of Servings</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={servings}
                    onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-300 font-semibold">Recipe Ingredients:</label>
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Ingredient
                  </button>
                </div>

                {ingredients.map((ing, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ingredient name (e.g. Cooked Rice, Dal, Chicken)"
                      value={ing.food_name}
                      onChange={(e) => handleIngredientChange(idx, 'food_name', e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) =>
                        handleIngredientChange(idx, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center"
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                      className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white"
                    >
                      <option value="g">g</option>
                      <option value="bowl">bowl</option>
                      <option value="rotis">rotis</option>
                      <option value="serving">serving</option>
                      <option value="ml">ml</option>
                    </select>
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  {isSaving ? 'Calculating & Saving...' : 'Save Recipe'}
                </button>
              </div>
            </form>
          ) : (
            /* Saved Recipes Tab */
            <div className="space-y-3">
              {savedRecipes.length > 0 ? (
                savedRecipes.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{r.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {r.servings} {r.servings === 1 ? 'serving' : 'servings'} • {Math.round(r.calories_per_serving)} kcal / serving
                      </p>
                      <div className="text-[10px] text-slate-400 flex gap-3 mt-1">
                        <span>P: <strong className="text-cyan-400">{r.protein_per_serving}g</strong></span>
                        <span>C: <strong className="text-emerald-400">{r.carbs_per_serving}g</strong></span>
                        <span>F: <strong className="text-amber-400">{r.fat_per_serving}g</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLogRecipeToMeal(r)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <Utensils className="w-3.5 h-3.5" /> Log Meal
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(r.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No saved recipes found. Create your first one above!
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
