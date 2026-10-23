import React from 'react';
import { 
  Sparkles, Calendar, ChevronLeft, ChevronRight, 
  PlusCircle, Barcode, BookOpen, Scale, FileText, 
  Settings as SettingsIcon, LogOut, User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  onOpenAddFood: () => void;
  onOpenBarcode: () => void;
  onOpenRecipes: () => void;
  onOpenWeight: () => void;
  onOpenWeeklyReport: () => void;
  onOpenOnboarding: () => void;
  onOpenSettings: () => void;
  calorieSummary?: { consumed: number; target: number };
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDate,
  onDateChange,
  onOpenAddFood,
  onOpenBarcode,
  onOpenRecipes,
  onOpenWeight,
  onOpenWeeklyReport,
  onOpenOnboarding,
  onOpenSettings,
  calorieSummary,
}) => {
  const { user, logout, loginAsDemo } = useAuth();

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  const formattedDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">NutriTrack</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent Nutrition Engine</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2 py-1 shadow-inner">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleToday}
            className="flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium text-slate-200 hover:text-emerald-400 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isToday ? `Today, ${formattedDate}` : formattedDate}</span>
          </button>

          <button
            onClick={handleNextDay}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons & Navigation */}
        <div className="flex items-center gap-2">
          
          {/* Add Food CTA */}
          <button
            onClick={onOpenAddFood}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Log Food</span>
          </button>

          {/* Barcode scanner */}
          <button
            onClick={onOpenBarcode}
            title="Scan Barcode (Open Food Facts)"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors"
          >
            <Barcode className="w-4 h-4" />
          </button>

          {/* Recipes */}
          <button
            onClick={onOpenRecipes}
            title="Recipe Builder"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors hidden md:flex"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Weight Tracker */}
          <button
            onClick={onOpenWeight}
            title="Weight & BMI Tracker"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors hidden md:flex"
          >
            <Scale className="w-4 h-4" />
          </button>

          {/* Weekly Report */}
          <button
            onClick={onOpenWeeklyReport}
            title="Weekly Nutrition Report"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors hidden lg:flex"
          >
            <FileText className="w-4 h-4" />
          </button>

          {/* User / Settings Profile */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <button
              onClick={onOpenSettings}
              title="Settings & Personal Targets"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {user ? (
              <button
                onClick={logout}
                title={`Logged in as ${user.email} (Click to Logout)`}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={loginAsDemo}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs font-medium hover:bg-emerald-500/10 transition-colors"
              >
                Demo
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
