import React, { useState } from 'react';
import { X, Barcode, Search, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogProductToMeal: (productItem: any) => void;
}

const SAMPLE_BARCODES = [
  { label: 'Thai Kitchen Coconut Milk', code: '737628064502' },
  { label: 'Nutella Hazelnut Spread', code: '3017620422003' },
  { label: 'Oat Milk Barista Edition', code: '7394376616037' },
];

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  onLogProductToMeal,
}) => {
  const [barcode, setBarcode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [portion, setPortion] = useState(100);

  if (!isOpen) return null;

  const handleLookup = async (codeToLookup?: string) => {
    const code = codeToLookup || barcode;
    if (!code.trim()) return;
    setIsLoading(true);
    setProduct(null);
    try {
      const res = await api.lookupBarcode(code);
      setProduct(res);
      setPortion(res.serving_size_g || 100);
    } catch (e: any) {
      alert(`Barcode lookup: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!product) return;
    const factor = portion / 100.0;
    const item = {
      food_id: product.id,
      food_name_snapshot: `${product.brand ? product.brand + ' ' : ''}${product.name}`,
      quantity: portion,
      unit: 'g',
      normalized_quantity_g: portion,
      calories: Math.round(product.calories_per_100g * factor),
      protein_g: Math.round(product.protein_per_100g * factor * 10) / 10,
      carbs_g: Math.round(product.carbs_per_100g * factor * 10) / 10,
      fat_g: Math.round(product.fat_per_100g * factor * 10) / 10,
      data_source: 'open_food_facts',
      image_url: product.image_url,
    };
    onLogProductToMeal(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Barcode Scanner</h3>
              <p className="text-xs text-slate-400">Open Food Facts packaged food database</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Barcode input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 8, 12, or 13-digit EAN/UPC barcode..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleLookup()}
              disabled={isLoading || !barcode.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
            >
              <Search className="w-3.5 h-3.5" />
              {isLoading ? 'Searching...' : 'Scan'}
            </button>
          </div>

          {/* Preset Barcodes */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
              Sample Barcodes for Testing:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_BARCODES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBarcode(s.code);
                    handleLookup(s.code);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                >
                  {s.label} ({s.code})
                </button>
              ))}
            </div>
          </div>

          {/* Product Result Preview */}
          {product && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-950 border border-slate-800 p-1 flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                    {product.brand || 'Packaged Product'}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{product.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {product.standard_serving_name || '100g'} standard serving
                  </p>
                </div>
              </div>

              {/* Portion Selector */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block mb-1">Serving Amount (g)</label>
                  <input
                    type="number"
                    value={portion}
                    onChange={(e) => setPortion(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Calculated Calories</span>
                  <span className="text-base font-black text-white">
                    {Math.round(product.calories_per_100g * (portion / 100))} kcal
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddProduct}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Log to Current Meal
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
