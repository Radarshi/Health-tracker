import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Insight } from '../types';

interface AnalyticsChartsViewProps {
  insights: Insight[];
}

const MACRO_COLORS = ['#06b6d4', '#10b981', '#f59e0b'];

export const AnalyticsChartsView: React.FC<AnalyticsChartsViewProps> = ({ insights }) => {
  const [trendDays, setTrendDays] = useState<number>(7);
  const [trendsData, setTrendsData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>({
    avgCalories: 0,
    avgProtein: 0,
    adherence: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, [trendDays]);

  const loadAnalytics = async () => {
    try {
      const [trendRes, weightRes] = await Promise.all([
        api.getCalorieAnalytics(trendDays),
        api.getWeightAnalytics(),
      ]);

      setTrendsData(trendRes.trends || []);
      setSummaryStats({
        avgCalories: trendRes.average_calories,
        avgProtein: trendRes.average_protein_g,
        adherence: trendRes.adherence_rate_pct,
      });
      setWeightData(weightRes || []);
    } catch (e) {
      console.warn('Analytics loading error:', e);
    }
  };

  // Macro pie data based on latest logged day or averages
  const totalCals = trendsData.reduce((acc, d) => acc + d.calories, 0);
  const totalProt = trendsData.reduce((acc, d) => acc + d.protein_g, 0);
  const totalCarbs = trendsData.reduce((acc, d) => acc + d.carbs_g, 0);
  const totalFat = trendsData.reduce((acc, d) => acc + d.fat_g, 0);

  const macroPieData = [
    { name: 'Protein (g)', value: Math.round(totalProt) || 120 },
    { name: 'Carbs (g)', value: Math.round(totalCarbs) || 210 },
    { name: 'Fat (g)', value: Math.round(totalFat) || 55 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section Header & Trend Days Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Nutritional Analytics & Trends
          </h2>
          <p className="text-xs text-slate-400">
            Historical calorie intake, macro balance, and weekly adherence
          </p>
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setTrendDays(7)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              trendDays === 7 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTrendDays(14)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              trendDays === 14 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTrendDays(30)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              trendDays === 30 ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Daily Calorie Average
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {Math.round(summaryStats.avgCalories)}{' '}
            <span className="text-xs font-normal text-slate-400">kcal / day</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Average Protein
          </span>
          <div className="text-2xl font-black text-cyan-400 mt-1">
            {summaryStats.avgProtein}{' '}
            <span className="text-xs font-normal text-slate-400">grams / day</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Target Adherence Rate
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {summaryStats.adherence}%{' '}
            <span className="text-xs font-normal text-slate-400">within 250 kcal</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Calorie Intake vs Target Bar Chart */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Daily Calorie Intake vs Target
            </h3>
            <span className="text-xs text-slate-400">kcal / day</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="calories" name="Consumed Calories" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target_calories" name="Daily Target" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Macronutrient Distribution Donut */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 mb-1">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Macronutrient Breakdown
            </h3>
            <p className="text-[11px] text-slate-400">Cumulative macro balance</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={macroPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macroPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-2 border-t border-slate-800">
            <div>
              <span className="text-cyan-400 font-bold block">Protein</span>
              <span className="text-white font-semibold">{macroPieData[0].value}g</span>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block">Carbs</span>
              <span className="text-white font-semibold">{macroPieData[1].value}g</span>
            </div>
            <div>
              <span className="text-amber-400 font-bold block">Fat</span>
              <span className="text-white font-semibold">{macroPieData[2].value}g</span>
            </div>
          </div>
        </div>

      </div>

      {/* Protein Intake Trend & Weight Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protein Line */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            Protein Intake Progression
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="protein_g"
                  name="Protein (g)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ fill: '#06b6d4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weight Progression */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Body Weight Trend (kg)
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="display_date" stroke="#64748b" fontSize={11} />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight_kg"
                  name="Weight (kg)"
                  stroke="#a855f7"
                  strokeWidth={2.5}
                  dot={{ fill: '#a855f7', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transparent AI Nutritional Insights */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Nutritional Insights & Observations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {insights.map((item, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                item.type === 'positive'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : item.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <div className="font-bold text-white flex items-center justify-between">
                <span>{item.title}</span>
                {item.data_point && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                    {item.data_point}
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-90">{item.message}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
