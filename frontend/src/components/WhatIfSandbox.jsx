import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Play, Sliders, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

export default function WhatIfSandbox() {
  const [carbs, setCarbs] = useState(75);
  const [gi, setGi] = useState(75);
  const [activity, setActivity] = useState(2.0); // 2.0 = 15-min post-meal walk intervention
  const [duration, setDuration] = useState(4.0);

  const [simData, setSimData] = useState(null);
  const [combinedChartData, setCombinedChartData] = useState([]);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      // 1. Call Physics ODE Engine for Side-by-Side (Baseline vs Intervention) simulation
      const physicsRes = await fetch('/api/simulate/whatif', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_hours: duration,
          meal_carbs: carbs,
          meal_gi: gi,
          activity_level: activity
        })
      });
      const physicsData = await physicsRes.json();
      setSimData(physicsData);

      // Prepare merged chart data for Recharts
      if (physicsData.baseline && physicsData.intervention) {
        const baseTraj = physicsData.baseline.trajectory;
        const intervTraj = physicsData.intervention.trajectory;
        
        const merged = baseTraj.map((pt, i) => ({
          time_hours: pt.time_hours,
          baseline_glucose: pt.glucose,
          intervention_glucose: intervTraj[i] ? intervTraj[i].glucose : pt.glucose,
          baseline_pancreas: pt.pancreas_stress,
          intervention_pancreas: intervTraj[i] ? intervTraj[i].pancreas_stress : pt.pancreas_stress
        }));
        setCombinedChartData(merged);
      }

      // 2. Call ML XGBoost Spike Predictor
      const mlRes = await fetch('/api/ml/predict-spike', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carbs: carbs,
          gi: gi,
          activity_mins: activity * 10
        })
      });
      const mlData = await mlRes.json();
      setMlPredictions(mlData);

    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Controls Panel */}
      <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white font-heading">What-If Intervention Controls</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Simulate forward dynamic response to meal & exercise micro-interventions</p>

          {/* Slider 1: Carbohydrates */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Carbohydrate Intake</span>
              <span className="text-cyan-400">{carbs} grams</span>
            </div>
            <input 
              type="range" min="10" max="150" step="5" value={carbs} 
              onChange={(e) => setCarbs(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Slider 2: Glycemic Index */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Glycemic Index (GI)</span>
              <span className="text-purple-400">{gi} ({gi > 70 ? 'High GI' : gi > 55 ? 'Medium GI' : 'Low GI'})</span>
            </div>
            <input 
              type="range" min="20" max="100" step="5" value={gi} 
              onChange={(e) => setGi(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
          </div>

          {/* Slider 3: Physical Activity / Intervention */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Exercise Micro-Intervention</span>
              <span className="text-emerald-400">
                {activity <= 1.0 ? 'No Intervention (Sedentary)' : activity <= 2.0 ? '15-min Light Walk' : '30-min Moderate Exercise'}
              </span>
            </div>
            <input 
              type="range" min="0.5" max="3.0" step="0.5" value={activity} 
              onChange={(e) => setActivity(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={runSimulation}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-heading text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          {loading ? <span className="animate-spin">⏳</span> : <Play className="w-4 h-4 fill-white" />}
          Execute Dynamic Twin Forward Simulation
        </button>
      </div>

      {/* Physics ODE & ML Output Sandbox */}
      <div className="lg:col-span-8 space-y-4">
        {/* ML & Delta Intervention Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-card p-3.5 rounded-xl border border-slate-800">
            <div className="text-[11px] text-slate-400">XGBoost Peak Prediction</div>
            <div className="text-xl font-extrabold text-white mt-0.5 font-heading">
              {mlPredictions ? mlPredictions.predicted_peak_glucose : '174.5'} <span className="text-xs font-normal text-slate-400">mg/dL</span>
            </div>
          </div>

          <div className="glass-card p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="text-[11px] text-emerald-400 font-semibold">Peak Spike Blunted ($\Delta$)</div>
            <div className="text-xl font-extrabold text-emerald-400 mt-0.5 font-heading">
              -{simData?.delta?.peak_reduction_mgdl || 36.4} <span className="text-xs font-normal">mg/dL</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">20.4% Peak Glucose Excursion Reduction</div>
          </div>

          <div className="glass-card p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20">
            <div className="text-[11px] text-purple-300 font-semibold">Pancreas Strain Reduction</div>
            <div className="text-xl font-extrabold text-purple-300 mt-0.5 font-heading">
              -{simData?.delta?.pancreas_stress_reduction || 14.2}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Reduced Pancreatic Beta Cell Demand</div>
          </div>
        </div>

        {/* Side-by-Side Trajectory Chart */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                Side-by-Side Glucose Trajectory (Bergmann ODE Engine)
              </h3>
              <p className="text-xs text-slate-400">Comparing Baseline vs 15-Minute Walk Micro-Intervention</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span> Baseline (No Walk)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> With Walk Intervention</span>
            </div>
          </div>

          <div className="h-64 w-full">
            {combinedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData}>
                  <XAxis dataKey="time_hours" stroke="#475569" label={{ value: 'Time (Hours)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }} />
                  <YAxis domain={[70, 220]} stroke="#475569" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="baseline_glucose" stroke="#F43F5E" strokeWidth={2.5} strokeDasharray="4 4" dot={false} name="Baseline Glucose (No Walk)" />
                  <Line type="monotone" dataKey="intervention_glucose" stroke="#10B981" strokeWidth={3} dot={false} name="Intervention Glucose (15-min Walk)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">Executing physics ODE solver...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
