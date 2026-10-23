import React, { useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { api } from '../services/api';
import { FoodRecognitionAnalysis, DetectedFoodRegion } from '../types';

interface PhotoAnalysisViewProps {
  mealType: string;
  onSaveItems: (items: any[]) => void;
  onCancel: () => void;
}

export const PhotoAnalysisView: React.FC<PhotoAnalysisViewProps> = ({
  mealType,
  onSaveItems,
  onCancel,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FoodRecognitionAnalysis | null>(null);
  const [confirmedRegions, setConfirmedRegions] = useState<
    Array<{
      food_name: string;
      quantity: number;
      unit: string;
      calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
    }>
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    try {
      const result = await api.analyzeImage(selectedFile);
      setAnalysisResult(result);
      
      // Initialize editable confirmation list
      const initial = result.detected_regions.map((reg) => ({
        food_name: reg.label,
        quantity: reg.suggested_portion,
        unit: reg.suggested_unit,
        calories: reg.nutrients_preview.calories,
        protein_g: reg.nutrients_preview.protein_g,
        carbs_g: reg.nutrients_preview.carbs_g,
        fat_g: reg.nutrients_preview.fat_g,
      }));
      setConfirmedRegions(initial);
    } catch (e: any) {
      alert(`Photo analysis error: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Quick Demo Plate sample button
  const handleUseSamplePlate = async () => {
    setIsAnalyzing(true);
    // Create dummy 1x1 canvas blob or fetch default
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 400, 300);
      ctx.fillStyle = '#10b981';
      ctx.font = '20px sans-serif';
      ctx.fillText('Bengali Thali (Rice, Dal, Roti)', 50, 150);
    }
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'sample_meal_plate.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        const result = await api.analyzeImage(file);
        setAnalysisResult(result);
        const initial = result.detected_regions.map((reg) => ({
          food_name: reg.label,
          quantity: reg.suggested_portion,
          unit: reg.suggested_unit,
          calories: reg.nutrients_preview.calories,
          protein_g: reg.nutrients_preview.protein_g,
          carbs_g: reg.nutrients_preview.carbs_g,
          fat_g: reg.nutrients_preview.fat_g,
        }));
        setConfirmedRegions(initial);
        setIsAnalyzing(false);
      }
    }, 'image/jpeg');
  };

  const handleUpdatePortion = (index: number, quantity: number, unit: string) => {
    setConfirmedRegions((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const ratio = quantity / (item.quantity || 1);
      updated[index] = {
        ...item,
        quantity,
        unit,
        calories: Math.round(item.calories * ratio),
        protein_g: Math.round(item.protein_g * ratio * 10) / 10,
        carbs_g: Math.round(item.carbs_g * ratio * 10) / 10,
        fat_g: Math.round(item.fat_g * ratio * 10) / 10,
      };
      return updated;
    });
  };

  const handleSaveConfirmed = () => {
    const items = confirmedRegions.map((r) => ({
      food_name_snapshot: r.food_name,
      quantity: r.quantity,
      unit: r.unit,
      calories: r.calories,
      protein_g: r.protein_g,
      carbs_g: r.carbs_g,
      fat_g: r.fat_g,
      data_source: 'foodsam_ai',
      recognition_confidence: 0.92,
      image_url: analysisResult?.image_url,
    }));
    onSaveItems(items);
  };

  const totalCalories = confirmedRegions.reduce((sum, r) => sum + r.calories, 0);

  return (
    <div className="space-y-6">
      {!analysisResult ? (
        <div className="space-y-4">
          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center transition-all bg-slate-900/40">
            {previewUrl ? (
              <div className="space-y-4">
                <img
                  src={previewUrl}
                  alt="Meal Preview"
                  className="max-h-64 mx-auto rounded-xl shadow-lg border border-slate-800 object-contain"
                />
                <div className="flex items-center justify-center gap-3">
                  <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition-colors">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Running FoodSAM AI...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Analyze Food Plate
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload or Capture Meal Photo</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    FoodSAM segments plate regions to detect multiple foods, cooked rice, curries, and flatbreads.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <label className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Select Image
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button
                    onClick={handleUseSamplePlate}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Use Sample Meal Plate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Analysis & Portion Confirmation Flow */
        <div className="space-y-5">
          {/* Top disclaimer */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">FoodSAM Regional Detection Complete: </span>
              {analysisResult.disclaimer}
            </div>
          </div>

          {/* Detected Items Confirmation Form */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Confirm Detections & Portions</h4>
              <span className="text-xs font-semibold text-emerald-400">
                Total: {Math.round(totalCalories)} kcal
              </span>
            </div>

            {confirmedRegions.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{item.food_name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {Math.round(item.calories)} kcal
                  </span>
                </div>

                {/* Portion Adjuster */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block mb-1">Portion Quantity</label>
                    <input
                      type="number"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdatePortion(idx, parseFloat(e.target.value) || 0, item.unit)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] text-slate-400 block mb-1">Unit</label>
                    <select
                      value={item.unit}
                      onChange={(e) =>
                        handleUpdatePortion(idx, item.quantity, e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="g">grams (g)</option>
                      <option value="bowl">bowl (250g)</option>
                      <option value="rotis">rotis / chapati</option>
                      <option value="serving">serving</option>
                      <option value="plate">plate (400g)</option>
                    </select>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex gap-4 pt-1">
                  <span>Protein: <strong className="text-white">{item.protein_g}g</strong></span>
                  <span>Carbs: <strong className="text-white">{item.carbs_g}g</strong></span>
                  <span>Fat: <strong className="text-white">{item.fat_g}g</strong></span>
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setAnalysisResult(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Analyze Another
            </button>
            <button
              onClick={handleSaveConfirmed}
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
