import React, { useState } from 'react';
import { X, Camera, MessageSquare, Search, Sparkles } from 'lucide-react';
import { PhotoAnalysisView } from './PhotoAnalysisView';
import { NaturalLanguageEntryView } from './NaturalLanguageEntryView';
import { FoodSearchView } from './FoodSearchView';
import { api } from '../services/api';

interface FoodLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: string;
  currentDate: string;
  onSuccess: () => void;
}

export const FoodLoggingModal: React.FC<FoodLoggingModalProps> = ({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  currentDate,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'text' | 'search'>('photo');
  const [selectedMealType, setSelectedMealType] = useState<string>(defaultMealType);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveItems = async (items: any[]) => {
    setIsSaving(true);
    try {
      await api.createMeal({
        meal_type: selectedMealType,
        date: currentDate,
        name: selectedMealType.replace('_', ' ').toUpperCase(),
        items: items,
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      alert(`Failed to save meal: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Log Food Intake</h3>
              <p className="text-xs text-slate-400">
                Choose photo segmentation, natural language, or manual search
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

        {/* Meal Type Bar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">Log into meal:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'breakfast', label: 'Breakfast' },
              { id: 'lunch', label: 'Lunch' },
              { id: 'dinner', label: 'Dinner' },
              { id: 'morning_snack', label: 'Snack' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMealType(m.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedMealType === m.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Method Switcher Tabs */}
        <div className="p-2 mx-6 mt-4 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'photo'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Photograph AI</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'text'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Natural Text</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Search Catalog</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'photo' && (
            <PhotoAnalysisView
              mealType={selectedMealType}
              onSaveItems={handleSaveItems}
              onCancel={onClose}
            />
          )}

          {activeTab === 'text' && (
            <NaturalLanguageEntryView
              mealType={selectedMealType}
              onSaveItems={handleSaveItems}
            />
          )}

          {activeTab === 'search' && (
            <FoodSearchView
              mealType={selectedMealType}
              onSaveItems={handleSaveItems}
            />
          )}
        </div>

      </div>
    </div>
  );
};
