import React, { useState, useEffect } from 'react';
import { X, Target, Sparkles, CheckCircle2, Info, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { profile, refreshProfileAndTargets } = useAuth();

  const [age, setAge] = useState<number>(27);
  const [sex, setSex] = useState<string>('male');
  const [heightCm, setHeightCm] = useState<number>(176);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(73.5);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(70);
  const [activityLevel, setActivityLevel] = useState<string>('moderate');
  const [goal, setGoal] = useState<string>('lose_weight');
  const [preferredRate, setPreferredRate] = useState<number>(0.5);
  const [dietaryPreference, setDietaryPreference] = useState<string>('none');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      if (profile.age) setAge(profile.age);
      if (profile.sex) setSex(profile.sex);
      if (profile.height_cm) setHeightCm(profile.height_cm);
      if (profile.current_weight_kg) setCurrentWeightKg(profile.current_weight_kg);
      if (profile.target_weight_kg) setTargetWeightKg(profile.target_weight_kg);
      if (profile.activity_level) setActivityLevel(profile.activity_level);
      if (profile.goal) setGoal(profile.goal);
      if (profile.preferred_rate) setPreferredRate(profile.preferred_rate);
      if (profile.dietary_preferences) setDietaryPreference(profile.dietary_preferences);
    }
  }, [profile]);

  if (!isOpen) return null;

  // Live client-side preview calculations (Mifflin-St Jeor)
  const base = 10.0 * currentWeightKg + 6.25 * heightCm - 5.0 * age;
  const bmr = Math.round(sex === 'female' ? base - 161 : base + 5);
  
  const multMap: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const multiplier = multMap[activityLevel] || 1.55;
  const tdee = Math.round(bmr * multiplier);

  let targetCals = tdee;
  if (goal === 'lose_weight') {
    targetCals = Math.round(tdee - (preferredRate * 7700) / 7);
  } else if (goal === 'gain_weight') {
    targetCals = Math.round(tdee + (preferredRate * 7700) / 7);
  }
  targetCals = Math.max(targetCals, sex === 'female' ? 1200 : 1400);

  const proteinG = Math.round(currentWeightKg * (goal === 'lose_weight' ? 2.0 : 1.8));
  const fatG = Math.round((targetCals * 0.28) / 9);
  const carbsG = Math.max(Math.round((targetCals - (proteinG * 4 + fatG * 9)) / 4), 50);

  const heightM = heightCm / 100;
  const bmi = Math.round((currentWeightKg / (heightM * heightM)) * 10) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateProfile({
        age,
        sex,
        height_cm: heightCm,
        current_weight_kg: currentWeightKg,
        target_weight_kg: targetWeightKg,
        activity_level: activityLevel,
        goal,
        preferred_rate: preferredRate,
        dietary_preferences: dietaryPreference,
      });
      await refreshProfileAndTargets();
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`);
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
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Personal Health Profile & Targets</h3>
              <p className="text-xs text-slate-400">
                Scientifically calculated using Mifflin–St Jeor & activity multipliers
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                min="12"
                max="100"
                required
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Biological Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="male">Male (+5 kcal Mifflin formula)</option>
                <option value="female">Female (-161 kcal Mifflin formula)</option>
                <option value="other">Other / Neutral</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(parseFloat(e.target.value) || 170)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                required
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(parseFloat(e.target.value) || 70)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Primary Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="lose_weight">Weight Loss</option>
                <option value="maintain">Maintenance</option>
                <option value="gain_weight">Weight / Muscle Gain</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="sedentary">Sedentary (Desk job, little exercise ×1.2)</option>
                <option value="light">Lightly Active (1-3 days/week ×1.375)</option>
                <option value="moderate">Moderately Active (3-5 days/week ×1.55)</option>
                <option value="active">Very Active (6-7 days/week ×1.725)</option>
                <option value="very_active">Extremely Active (Athletic/heavy labor ×1.9)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Preferred Rate (kg / week)</label>
              <select
                value={preferredRate}
                onChange={(e) => setPreferredRate(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value={0.25}>0.25 kg/week (Gentle)</option>
                <option value={0.5}>0.5 kg/week (Standard / Recommended)</option>
                <option value={0.75}>0.75 kg/week (Accelerated)</option>
                <option value={1.0}>1.0 kg/week (Maximum Safe Rate)</option>
              </select>
            </div>
          </div>

          {/* Live Calculated Estimates Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Live Nutritional Target Calculation
              </span>
              <span className="text-slate-400">BMI: <strong className="text-white">{bmi}</strong> (Screening)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Basal BMR</span>
                <strong className="text-white">{bmr} kcal</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TDEE</span>
                <strong className="text-white">{tdee} kcal</strong>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 block font-semibold">Daily Calorie Target</span>
                <strong className="text-emerald-400 font-extrabold text-sm">{targetCals} kcal</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block">Protein Goal</span>
                <strong className="text-cyan-400">{proteinG}g / day</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Carbs Goal</span>
                <strong className="text-emerald-400">{carbsG}g / day</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Fat Goal</span>
                <strong className="text-amber-400">{fatG}g / day</strong>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
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
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? 'Recalculating...' : 'Save & Update Targets'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
