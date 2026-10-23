import React, { useState } from 'react';
import { MessageSquare, Sparkles, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface NaturalLanguageEntryViewProps {
  mealType: string;
  onSaveItems: (items: any[]) => void;
}

const SAMPLE_ENTRIES = [
  "I ate two medium rotis, one bowl of dal, 150 grams of cooked rice, and 120 grams of chicken curry",
  "1 bowl of basmati rice, 2 boiled eggs, and a cucumber salad",
  "2 scoops of whey protein and 1 medium banana",
];

export const NaturalLanguageEntryView: React.FC<NaturalLanguageEntryViewProps> = ({
  mealType,
  onSaveItems,
}) => {
  const [inputText, setInputText] = useState<string>(
    'I ate two medium rotis, one bowl of dal, 150 grams of cooked rice, and 120 grams of chicken curry'
  );
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<any | null>(null);

  const handleParse = async () => {
    if (!inputText.trim()) return;
    setIsParsing(true);
    try {
      const res = await api.parseNaturalLanguageFood(inputText);
      setParseResult(res);
    } catch (e: any) {
      alert(`Text parse error: ${e.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = () => {
    if (!parseResult || !parseResult.detected_items) return;
    const items = parseResult.detected_items.map((item: any) => {
      const caloriesPer100g = item.calories_per_100g || 130.0;
      const p100 = item.protein_per_100g || 3.0;
      const c100 = item.carbs_per_100g || 20.0;
      const f100 = item.fat_per_100g || 2.0;
      
      // Calculate portion
      let grams = 100.0;
      if (item.unit === 'g' || item.unit === 'grams') grams = item.quantity;
      else if (item.unit === 'bowl' || item.unit === 'bowls') grams = item.quantity * 200.0;
      else if (item.unit === 'roti' || item.unit === 'rotis' || item.unit === 'chapati') grams = item.quantity * 35.0;
      else if (item.unit === 'piece' || item.unit === 'pieces') grams = item.quantity * 50.0;

      const scale = grams / 100.0;

      return {
        food_id: item.matched_food_id,
        food_name_snapshot: item.matched_food_name || item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        normalized_quantity_g: grams,
        preparation_method: item.preparation_method,
        calories: Math.round(caloriesPer100g * scale),
        protein_g: Math.round(p100 * scale * 10) / 10,
        carbs_g: Math.round(c100 * scale * 10) / 10,
        fat_g: Math.round(f100 * scale * 10) / 10,
        data_source: 'nlp_parsed',
      };
    });

    onSaveItems(items);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          Describe what you ate in natural language:
        </label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. 2 chapatis, 1 bowl of dal tadka, and 150g grilled chicken"
          className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 transition-colors focus:outline-none"
        />
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
          Try an example:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_ENTRIES.map((sample, i) => (
            <button
              key={i}
              onClick={() => {
                setInputText(sample);
                setParseResult(null);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors truncate max-w-xs"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleParse}
          disabled={isParsing || !inputText.trim()}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isParsing ? 'Parsing Sentence...' : 'Extract Food & Nutrition'}
        </button>
      </div>

      {/* Parse Preview */}
      {parseResult && (
        <div className="space-y-4 pt-3 border-t border-slate-800">
          {/* Ambiguity questions if any */}
          {parseResult.has_ambiguity && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-200">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Unit & Portion Clarification:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 pl-1">
                {parseResult.clarification_questions.map((q: string, idx: number) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detected items list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Extracted Food Items:</h4>
            {parseResult.detected_items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">
                    {item.matched_food_name || item.food_name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Quantity: <span className="text-emerald-400 font-medium">{item.quantity} {item.unit}</span>
                    {item.preparation_method && (
                      <span className="ml-2 text-slate-500">• {item.preparation_method}</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-300 font-bold">
                    {item.matched_food_name ? 'Matched Database' : 'Estimated'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save to {mealType.replace('_', ' ').toUpperCase()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
