import React, { useState, useEffect } from 'react';
import { X, Scale, Plus, CheckCircle2, TrendingDown, TrendingUp } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface WeightTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WeightTrackerModal: React.FC<WeightTrackerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { profile, refreshProfileAndTargets } = useAuth();
  const [weightInput, setWeightInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
      if (profile?.current_weight_kg) {
        setWeightInput(profile.current_weight_kg.toString());
      }
    }
  }, [isOpen, profile]);

  const loadHistory = async () => {
    try {
      const data = await api.getMeasurements();
      setMeasurements(data);
    } catch (e) {
      console.warn('Measurements load error:', e);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (!w || w <= 0) return;

    setIsSubmitting(true);
    try {
      await api.addMeasurement({ weight_kg: w, notes });
      await refreshProfileAndTargets();
      await loadHistory();
      onSuccess();
      setNotes('');
    } catch (err: any) {
      alert(`Error saving weight: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentWeight = profile?.current_weight_kg || 73.5;
  const targetWeight = profile?.target_weight_kg || 70.0;
  const heightCm = profile?.height_cm || 176.0;
  const heightM = heightCm / 100.0;
  const currentBmi = Math.round((currentWeight / (heightM * heightM)) * 10) / 10;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Weight & Body Metrics</h3>
              <p className="text-xs text-slate-400">Track weight progression and BMI over time</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current</span>
              <strong className="text-lg font-black text-white">{currentWeight} kg</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Target</span>
              <strong className="text-lg font-black text-emerald-400">{targetWeight} kg</strong>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current BMI</span>
              <strong className="text-lg font-black text-purple-400">{currentBmi}</strong>
            </div>
          </div>

          {/* New Entry Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white">Log Today's Body Weight</h4>
            <div className="flex gap-3">
              <div className="w-36">
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="kg"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Optional notes (e.g. fasted morning weight)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-purple-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Log
              </button>
            </div>
          </form>

          {/* Historical Log */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 mb-2">Recent Logged Weights</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {measurements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-400">{m.date}</span>
                  <span className="font-bold text-white">{m.weight_kg} kg</span>
                  <span className="text-purple-400 text-[11px]">BMI {m.bmi || '-'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
