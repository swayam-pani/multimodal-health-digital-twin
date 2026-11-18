import React, { useState, useEffect } from 'react';
import Avatar3D from './components/Avatar3D';
import TelemetryDashboard from './components/TelemetryDashboard';
import WhatIfSandbox from './components/WhatIfSandbox';
import FoodVisionScanner from './components/FoodVisionScanner';
import PreventiveInsights from './components/PreventiveInsights';
import { Cpu, Activity, Sliders, Camera, ShieldCheck, Sparkles, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('twin');
  const [selectedOrgan, setSelectedOrgan] = useState('pancreas');
  const [liveTelemetry, setLiveTelemetry] = useState(null);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [calibratedProfile, setCalibratedProfile] = useState(null);

  // Poll real-time backend telemetry from PMData IoT digital thread if not manually overridden
  useEffect(() => {
    if (isManualOverride) return;

    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry/live');
        if (res.ok) {
          const data = await res.json();
          setLiveTelemetry(data);
        }
      } catch (err) {
        console.error("Telemetry fetch error:", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, [isManualOverride]);

  const handleManualUpdate = (customTelemetry) => {
    setIsManualOverride(true);
    setLiveTelemetry(customTelemetry);
  };

  const handleCalibratedData = (cgmResult) => {
    if (!cgmResult) return;
    setIsManualOverride(true);
    setCalibratedProfile(cgmResult.calibrated_parameters);
    setLiveTelemetry(prev => ({
      ...prev,
      cgm_glucose: cgmResult.basal_glucose || 98.0,
      soh_score: 94.0,
      organ_heatmaps: {
        pancreas: 22.0,
        liver: 25.0,
        heart: 18.0,
        muscle: 40.0,
        brain: 92.0
      }
    }));
  };

  const handleApplyIntervention = (itemOrResult) => {
    if (!itemOrResult) return;
    setIsManualOverride(true);
    if (itemOrResult.updated_cgm_glucose !== undefined) {
      // Direct closed-loop ODE result from backend
      setLiveTelemetry(prev => ({
        ...prev,
        cgm_glucose: itemOrResult.updated_cgm_glucose,
        soh_score: itemOrResult.soh_score,
        organ_heatmaps: itemOrResult.updated_organ_heatmaps
      }));
    } else {
      // Fallback
      setLiveTelemetry(prev => {
        if (!prev) return prev;
        const bluntedGlucose = Math.max(85, (prev.cgm_glucose || 110) - 25);
        return {
          ...prev,
          cgm_glucose: Math.round(bluntedGlucose * 10) / 10,
          soh_score: Math.min(100, (prev.soh_score || 90) + 6),
          organ_heatmaps: {
            ...prev.organ_heatmaps,
            pancreas: Math.max(10, (prev.organ_heatmaps?.pancreas || 30) - 15),
            heart: Math.max(10, (prev.organ_heatmaps?.heart || 35) - 10)
          }
        };
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white font-heading tracking-tight flex items-center gap-2">
              Multimodal Health Digital Twin
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-medium">
                XGBoost + Bergmann ODE Core
              </span>
            </h1>
            <p className="text-xs text-slate-400">Physics-Informed Biological Simulation & Preventive Healthcare Engine</p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 text-xs">
          <div className="glass-card px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300">Data Feed: <strong className="text-white">{isManualOverride ? 'Patient CGM / Calibrated Stream' : 'PMData IoT Digital Thread'}</strong></span>
          </div>
          <div className="glass-card px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Model Architecture: <strong className="text-cyan-400">XGBoost & Bergmann ODE</strong></span>
          </div>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'twin' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
        >
          <Cpu className="w-4 h-4" /> 3D Digital Twin Avatar & Live Telemetry
        </button>
        <button
          onClick={() => setActiveTab('whatif')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'whatif' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
        >
          <Sliders className="w-4 h-4" /> "What-If" Dynamic Simulation Sandbox
        </button>
        <button
          onClick={() => setActiveTab('food')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'food' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
        >
          <Camera className="w-4 h-4" /> Multimodal Food AI Scanner
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === 'insights' ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Preventive Care Recommendations
        </button>
      </div>

      {/* Main Tab Content Display */}
      {activeTab === 'twin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <Avatar3D 
                liveTelemetry={liveTelemetry} 
                selectedOrgan={selectedOrgan} 
                setSelectedOrgan={setSelectedOrgan} 
              />
            </div>
            <div className="lg:col-span-7">
              <TelemetryDashboard 
                liveTelemetry={liveTelemetry} 
                onManualUpdate={handleManualUpdate} 
                onCalibratedData={handleCalibratedData}
                calibratedProfile={calibratedProfile}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'whatif' && (
        <WhatIfSandbox />
      )}

      {activeTab === 'food' && (
        <FoodVisionScanner />
      )}

      {activeTab === 'insights' && (
        <PreventiveInsights 
          liveTelemetry={liveTelemetry} 
          onApplyIntervention={handleApplyIntervention}
          calibratedProfile={calibratedProfile}
        />
      )}

      {/* Footer */}
      <footer className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <div>AI-Powered Multimodal Health Digital Twin Framework | BCSE497J Project - I</div>
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> 3D WebGL Avatar + Bergmann Minimal ODE + XGBoost Machine Learning
        </div>
      </footer>
    </div>
  );
}
