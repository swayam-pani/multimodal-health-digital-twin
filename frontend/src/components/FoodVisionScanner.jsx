import React, { useState, useRef } from 'react';
import { Camera, Utensils, Sparkles, Upload, FileImage, ShieldCheck } from 'lucide-react';

export default function FoodVisionScanner() {
  const [query, setQuery] = useState('');
  const [foodData, setFoodData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleAnalyzeQuery = async (termToAnalyze) => {
    const searchTerm = termToAnalyze || query || "Grilled Chicken Salad";
    setLoading(true);
    try {
      const res = await fetch('/api/food/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm })
      });
      const data = await res.json();
      setFoodData(data);
    } catch (err) {
      console.error("Food vision search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create local image preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/food/upload-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setFoodData(data);
    } catch (err) {
      console.error("Food image upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-heading">Multimodal Food AI & Glycemic Scanner</h3>
          </div>
          <p className="text-xs text-slate-400">Upload ANY food photo or type any dish name for instant vision macro parsing</p>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> AI Vision Classifier
        </div>
      </div>

      {/* File Upload Dropzone + Text Search Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Upload Box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="md:col-span-5 border-2 border-dashed border-slate-700 hover:border-cyan-400/80 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-900/60 hover:bg-slate-900/90 group min-h-[140px]"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          {imagePreview ? (
            <div className="relative w-full h-28">
              <img src={imagePreview} alt="Uploaded Food" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg text-xs font-semibold text-white">
                Change Photo
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-all inline-block">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Click or Drop ANY Food Photo</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, WebP</p>
              </div>
            </div>
          )}
        </div>

        {/* Text Input Search */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-3">
          <div>
            <label className="text-xs text-slate-300 font-semibold mb-1.5 block">Or Type Any Food Dish Description</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Grilled Salmon Bowl, Avocado Toast, Apple with Almonds..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleAnalyzeQuery()}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                {loading ? 'Analyzing...' : 'Analyze'}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <div className="text-[11px] text-slate-400 mb-1.5">Quick Presets:</div>
            <div className="flex flex-wrap gap-1.5">
              {["Pepperoni Pizza", "Chicken Salad", "Oatmeal Berries", "Salmon Roll", "Apple Toast"].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(item); handleAnalyzeQuery(item); }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/50 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Output Results Card */}
      {foodData && (
        <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Scanned Meal Profile</span>
              {foodData.is_gemini ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Google Gemini Vision
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  USDA Grounded
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-white font-heading mt-1">{foodData.name}</h4>
            {foodData.category && (
              <span className="text-xs text-purple-400 font-medium">{foodData.category}</span>
            )}
            
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="p-2 rounded-lg bg-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Calories</div>
                <div className="text-sm font-bold text-white">{foodData.calories} kcal</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Carbs</div>
                <div className="text-sm font-bold text-cyan-400">{foodData.carbs}g</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 text-center">
                <div className="text-[10px] text-slate-400">Glycemic Index</div>
                <div className="text-sm font-bold text-purple-400">{foodData.gi}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
            <div>
              <div className="text-xs text-slate-400 mb-2">Nutritional Macro Balance</div>
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between"><span>Protein:</span> <span className="font-semibold text-emerald-400">{foodData.protein}g</span></div>
                <div className="flex justify-between"><span>Healthy Fats:</span> <span className="font-semibold text-amber-400">{foodData.fat}g</span></div>
                <div className="flex justify-between"><span>Dietary Fiber:</span> <span className="font-semibold text-cyan-400">{foodData.fiber}g</span></div>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-cyan-200 flex flex-col gap-1.5">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">Twin Impact: </span>
                  <span>{foodData.twin_impact || `Glycemic Index ${foodData.gi} (${foodData.gi > 70 ? 'High Spike Potential' : 'Moderate Glycemic Surge'}).`}</span>
                </div>
              </div>
              {foodData.actionable_tip && (
                <div className="text-[10px] text-cyan-300/90 ml-6">
                  <span className="font-semibold text-amber-300">Tip: </span>{foodData.actionable_tip}
                </div>
              )}
              {foodData.analysis_method && (
                <div className="text-[10px] text-slate-400 ml-6">
                  {foodData.analysis_method}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
