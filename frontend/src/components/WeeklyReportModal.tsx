import React, { useState, useEffect } from 'react';
import { X, FileText, Printer, CheckCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReport();
    }
  }, [isOpen]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getWeeklyReport();
      setReport(data);
    } catch (e) {
      console.warn('Failed to load weekly report:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Weekly Nutrition Summary</h3>
              <p className="text-xs text-slate-400">Comprehensive adherence & intake report</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        {isLoading || !report ? (
          <div className="p-12 text-center text-xs text-slate-400">Generating report...</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400">Member: </span>
                <strong className="text-white">{report.user_name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Period: </span>
                <strong className="text-emerald-400">{report.period}</strong>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Calories</span>
                <strong className="text-base font-black text-white">{report.summary.avg_calories} kcal</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Protein</span>
                <strong className="text-base font-black text-cyan-400">{report.summary.avg_protein_g}g</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Adherence</span>
                <strong className="text-base font-black text-emerald-400">{report.summary.adherence_rate}</strong>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Logged Days</span>
                <strong className="text-base font-black text-purple-400">{report.summary.logged_days}</strong>
              </div>
            </div>

            {/* Daily History Table */}
            <div>
              <h4 className="text-xs font-bold text-white mb-2">Daily Breakdown</h4>
              <div className="border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Intake</th>
                      <th className="p-2.5">Target</th>
                      <th className="p-2.5">Protein</th>
                      <th className="p-2.5">Carbs</th>
                      <th className="p-2.5">Fat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {report.trends.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="p-2.5 font-medium">{row.date}</td>
                        <td className="p-2.5 font-bold text-white">{row.calories} kcal</td>
                        <td className="p-2.5 text-slate-400">{row.target_calories}</td>
                        <td className="p-2.5 text-cyan-400">{row.protein_g}g</td>
                        <td className="p-2.5 text-emerald-400">{row.carbs_g}g</td>
                        <td className="p-2.5 text-amber-400">{row.fat_g}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence-Backed Observations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Recommendations for Next Week:
              </h4>
              <div className="space-y-1.5">
                {report.insights.map((ins: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <strong className="text-emerald-400 block mb-0.5">{ins.title}</strong>
                    <p className="text-slate-300 text-[11px]">{ins.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
