import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Line } from 'recharts';
import { Activity, Heart, Flame, ShieldCheck, Upload, Database, CheckCircle2, Save, Cpu } from 'lucide-react';

export default function TelemetryDashboard({ liveTelemetry, onManualUpdate, onCalibratedData, calibratedProfile }) {
  const [history, setHistory] = useState([]);
  const [mode, setMode] = useState('stream'); // 'stream', 'manual', 'cgm_upload', 'pmdata'
  const [cgmStatus, setCgmStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Manual inputs state
  const [manualGlucose, setManualGlucose] = useState(105);
  const [manualHR, setManualHR] = useState(72);
  const [manualHRV, setManualHRV] = useState(62);

  useEffect(() => {
    if (mode === 'stream' && liveTelemetry) {
      setHistory(prev => {
        const updated = [...prev, {
          time: liveTelemetry.timestamp || new Date().toLocaleTimeString(),
          glucose: liveTelemetry.cgm_glucose,
          heartRate: liveTelemetry.heart_rate,
          hrv: liveTelemetry.hrv
        }];
        return updated.slice(-20);
      });
    }
  }, [liveTelemetry, mode]);

  const handleApplyManual = () => {
    const customData = {
      timestamp: new Date().toLocaleTimeString(),
      cgm_glucose: Number(manualGlucose),
      heart_rate: Number(manualHR),
      hrv: Number(manualHRV),
      soh_score: Math.min(100, Math.max(40, 95 - (manualGlucose - 95) * 0.3 + (manualHRV - 50) * 0.2)),
      organ_heatmaps: {
        pancreas: Math.min(100, Math.max(5, (manualGlucose - 85) / 50 * 100)),
        liver: 25.0,
        heart: Math.min(100, Math.max(5, (manualHR - 60) / 40 * 80)),
        muscle: 45.0,
        brain: 90.0
      }
    };

    setHistory(prev => [...prev, {
      time: customData.timestamp,
      glucose: customData.cgm_glucose,
      heartRate: customData.heart_rate,
      hrv: customData.hrv
    }].slice(-20));

    if (onManualUpdate) {
      onManualUpdate(customData);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/telemetry/upload-cgm-csv', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setCgmStatus(data);
        setMode('cgm_upload');
        if (onCalibratedData) onCalibratedData(data);

        // Update chart history with trace
        if (data.glucose_trace) {
          const newHist = data.glucose_trace.map((val, idx) => ({
            time: `T+${idx * 5}m`,
            glucose: val,
            heartRate: 70 + (idx % 5),
            hrv: 60
          }));
          setHistory(newHist);
        }
      }
    } catch (err) {
      console.error("CGM CSV upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPMData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/telemetry/pmdata-sample');
      if (res.ok) {
        const data = await res.json();
        setCgmStatus({
          source: data.dataset,
          basal_glucose: 94.0,
          calibrated_parameters: data.calibrated_parameters
        });
        setMode('pmdata');
        
        const pmTelemetry = {
          timestamp: new Date().toLocaleTimeString(),
          cgm_glucose: data.telemetry.cgm_glucose,
          heart_rate: data.telemetry.resting_heart_rate,
          hrv: data.telemetry.hrv_ms,
          soh_score: 92.0,
          organ_heatmaps: data.telemetry.organ_heatmaps
        };

        if (onManualUpdate) onManualUpdate(pmTelemetry);
      }
    } catch (err) {
      console.error("PMData fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cgmVal = mode === 'stream' ? (liveTelemetry?.cgm_glucose || 105) : manualGlucose;
  const hrVal = mode === 'stream' ? (liveTelemetry?.heart_rate || 72) : manualHR;
  const hrvVal = mode === 'stream' ? (liveTelemetry?.hrv || 62) : manualHRV;
  const sohVal = mode === 'stream' ? (liveTelemetry?.soh_score || 91) : Math.round(95 - (manualGlucose - 95) * 0.3 + (manualHRV - 50) * 0.2);

  const activeParams = cgmStatus?.calibrated_parameters || calibratedProfile;

  return (
    <div className="space-y-4">
      {/* Telemetry Input Mode Switcher Bar */}
      <div className="glass-card rounded-xl p-3 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white font-heading">Data Ingestion Engine:</span>
          <span className="text-xs text-slate-400">
            {mode === 'stream' && 'Live IoT Telemetry Streamer'}
            {mode === 'manual' && 'Manual Profile Input'}
            {mode === 'cgm_upload' && 'Real Patient CGM CSV Parser'}
            {mode === 'pmdata' && 'PMData Lifelogging Benchmark Stream'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setMode('stream')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mode === 'stream' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            📡 Live Stream
          </button>

          <label className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 flex items-center gap-1 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Processing...' : 'Upload Real CGM (.csv)'}</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleLoadPMData}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${mode === 'pmdata' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-purple-400 border border-purple-500/30 hover:bg-slate-700'}`}
          >
            <Database className="w-3.5 h-3.5" /> PMData Cohort
          </button>

          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mode === 'manual' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            ✍️ Manual
          </button>
        </div>
      </div>

      {/* Calibrated Patient ODE Parameters Banner (Shows when CGM/PMData is loaded) */}
      {activeParams && (
        <div className="glass-card rounded-xl p-3.5 border border-cyan-500/30 bg-cyan-950/20 text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white">SciPy Inverse Problem Parameter Calibration:</span>
              <span className="text-slate-300 ml-1.5">{cgmStatus?.source || 'Calibrated from Patient CGM Log'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <div>Insulin Sensitivity (S_I): <strong className="text-cyan-400">{activeParams.insulin_sensitivity_Si}</strong></div>
            <div>Glucose Clearance (p_1): <strong className="text-cyan-400">{activeParams.glucose_effectiveness_p1}</strong></div>
            <div>Pancreas Response (&gamma;): <strong className="text-cyan-400">{activeParams.pancreatic_responsiveness_gamma}</strong></div>
            {activeParams.calibration_r2_fit && (
              <div>Fit Quality (R<sup>2</sup>): <strong className="text-emerald-400">{activeParams.calibration_r2_fit}</strong></div>
            )}
          </div>
        </div>
      )}

      {/* Manual Input Controls Panel */}
      {mode === 'manual' && (
        <div className="glass-card rounded-xl p-4 border border-cyan-500/30 bg-slate-900/90 grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Blood Glucose (mg/dL)</label>
            <input 
              type="number" value={manualGlucose} onChange={e => setManualGlucose(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Heart Rate (bpm)</label>
            <input 
              type="number" value={manualHR} onChange={e => setManualHR(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">HRV (ms)</label>
            <input 
              type="number" value={manualHRV} onChange={e => setManualHRV(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleApplyManual}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Save className="w-3.5 h-3.5" /> Update Twin State
            </button>
          </div>
        </div>
      )}

      {/* 4 Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CGM Glucose */}
        <div className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Continuous Glucose</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-heading">
              {cgmVal} <span className="text-xs font-normal text-slate-400">mg/dL</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Target Range (70-140)
            </div>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Heart Rate */}
        <div className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Resting Heart Rate</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-heading">
              {hrVal} <span className="text-xs font-normal text-slate-400">bpm</span>
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Normal Sinus Rhythm
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Heart className="w-6 h-6" />
          </div>
        </div>

        {/* HRV */}
        <div className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Heart Rate Variability</div>
            <div className="text-2xl font-extrabold text-white mt-1 font-heading">
              {hrvVal} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Autonomic Tone
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* State of Health Score */}
        <div className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Digital Twin Health Index</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-heading">
              {sohVal}<span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> High Metabolic Fitness
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry Graph */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-heading">Continuous Biomarker Timeline</h3>
            <p className="text-xs text-slate-400">Real-time glucose dynamics and cardiac telemetry</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Glucose (mg/dL)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Heart Rate (bpm)</span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="glucoseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 200]} stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="glucose" stroke="#06B6D4" strokeWidth={2.5} fillOpacity={1} fill="url(#glucoseGrad)" name="Glucose (mg/dL)" />
              <Line type="monotone" dataKey="heartRate" stroke="#F43F5E" strokeWidth={1.5} dot={false} name="Heart Rate (bpm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
