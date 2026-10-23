import React from 'react';
import { Flame, Droplets, Target, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { DailySummary } from '../types';

interface DailySummaryCardProps {
  summary: DailySummary;
  onLogWater: (amount: number) => void;
  onOpenOnboarding: () => void;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({
  summary,
  onLogWater,
  onOpenOnboarding,
}) => {
  const { calories, macros, hydration } = summary;

  const isOverTarget = calories.remaining < 0;
  const absRemaining = Math.abs(calories.remaining);

  // SVG Circular progress math
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(calories.percent, 100) / 100) * circumference;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-2xl">
      {/* Background subtle radial glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Calorie Dial & Progress */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
          <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-slate-800"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className={`transition-all duration-1000 ease-out ${
                  isOverTarget ? 'text-amber-400' : 'text-emerald-400'
                }`}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <Flame className={`w-5 h-5 mb-0.5 ${isOverTarget ? 'text-amber-400' : 'text-emerald-400'}`} />
              <span className="text-2xl font-black text-white tracking-tight">
                {Math.round(calories.consumed)}
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                kcal eaten
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Calorie Target</span>
            </div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {Math.round(calories.target)}{' '}
              <span className="text-base font-normal text-slate-400">kcal</span>
            </div>
            <p className="text-xs text-slate-400">
              {isOverTarget ? (
                <span className="text-amber-400 font-medium">
                  +{Math.round(absRemaining)} kcal over daily target
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  {Math.round(calories.remaining)} kcal remaining today
                </span>
              )}
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenOnboarding}
                className="text-[11px] text-slate-400 hover:text-emerald-400 underline underline-offset-4 transition-colors flex items-center gap-1 mx-auto sm:mx-0"
              >
                <Target className="w-3 h-3" />
                Customize targets & goals
              </button>
            </div>
          </div>
        </div>

        {/* Macronutrients Progress Bars */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          
          {/* Protein */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Protein</span>
              <span className="text-white font-bold">{Math.round(macros.protein.consumed)}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(macros.protein.percent, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Goal: {Math.round(macros.protein.target)}g</span>
              <span>{Math.round(macros.protein.percent)}%</span>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Carbohydrates</span>
              <span className="text-white font-bold">{Math.round(macros.carbs.consumed)}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                style={{ width: `${Math.min(macros.carbs.percent, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Goal: {Math.round(macros.carbs.target)}g</span>
              <span>{Math.round(macros.carbs.percent)}%</span>
            </div>
          </div>

          {/* Fat */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Fats</span>
              <span className="text-white font-bold">{Math.round(macros.fat.consumed)}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${Math.min(macros.fat.percent, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Goal: {Math.round(macros.fat.target)}g</span>
              <span>{Math.round(macros.fat.percent)}%</span>
            </div>
          </div>

          {/* Fiber */}
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Dietary Fiber</span>
              <span className="text-white font-bold">{Math.round(macros.fiber.consumed)}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                style={{ width: `${Math.min(macros.fiber.percent, 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>Goal: {Math.round(macros.fiber.target)}g</span>
              <span>{Math.round(macros.fiber.percent)}%</span>
            </div>
          </div>

        </div>

        {/* Hydration Tracker */}
        <div className="lg:col-span-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Hydration</span>
              </div>
              <span className="text-xs font-bold text-cyan-400">
                {Math.round(hydration.consumed_ml)} / {Math.round(hydration.target_ml)} ml
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(hydration.percent, 100)}%` }}
              />
            </div>
          </div>

          {/* Quick Log Water Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onLogWater(250)}
              className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 250 ml
            </button>
            <button
              onClick={() => onLogWater(500)}
              className="flex-1 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> 500 ml
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
