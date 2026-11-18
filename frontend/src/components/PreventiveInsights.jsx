import React, { useEffect, useState } from 'react';
import { Lightbulb, CheckCircle2, Zap, Download, FileText, ShieldCheck, Loader2 } from 'lucide-react';

export default function PreventiveInsights({ liveTelemetry, onApplyIntervention, calibratedProfile }) {
  const [recommendations, setRecommendations] = useState([]);
  const [appliedActions, setAppliedActions] = useState({});
  const [activeMessage, setActiveMessage] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchRecoms = async () => {
      try {
        const cgm = liveTelemetry?.cgm_glucose || 110;
        const res = await fetch(`/api/recommendations?current_g=${cgm}&predicted_peak=${cgm + 38}`);
        if (res.ok) {
          const data = await res.json();
          setRecommendations(data);
        }
      } catch (err) {
        console.error("Recommendations fetch error:", err);
      }
    };
    fetchRecoms();
  }, [liveTelemetry?.cgm_glucose]);

  const handleApply = async (item, idx) => {
    try {
      const res = await fetch('/api/twin/apply-intervention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intervention_id: item.id || 'post_prandial_walk',
          current_glucose: liveTelemetry?.cgm_glucose || 110.0,
          activity_boost: item.activity_boost || 2.2
        })
      });

      if (res.ok) {
        const result = await res.json();
        setAppliedActions(prev => ({ ...prev, [idx]: true }));
        
        if (onApplyIntervention) {
          onApplyIntervention(result);
        }

        setActiveMessage({
          title: `Applied Action: ${item.title}`,
          details: `${item.impact}. Bergmann ODE forward simulation completed: Updated 3D avatar organ heatmaps & reduced glucose by ${result.glucose_reduction_mgdl} mg/dL.`
        });

        setTimeout(() => {
          setActiveMessage(null);
        }, 7000);
      }
    } catch (err) {
      console.error("Failed to apply intervention:", err);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const res = await fetch('/api/report/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telemetry_data: liveTelemetry,
          calibrated_params: calibratedProfile
        })
      });

      if (!res.ok) {
        throw new Error(`PDF generation returned status ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Health_Digital_Twin_Diagnostic_Report_${new Date().toISOString().slice(0,10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading PDF:", err);
      // Fallback direct link
      window.open('/api/report/download-pdf', '_blank');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white font-heading">Preventive Care & Closed-Loop Interventions</h3>
          </div>
          <p className="text-xs text-slate-400">Click any micro-intervention to execute closed-loop ODE feedback to your Digital Twin avatar</p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Generating Clinical PDF...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" /> Download Diagnostic Report (PDF)
            </>
          )}
        </button>
      </div>

      {/* Applied Feedback Banner */}
      {activeMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between animate-fade-in shadow-lg shadow-emerald-500/10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-white text-sm">{activeMessage.title}</div>
              <div className="text-emerald-300 mt-0.5">{activeMessage.details}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-800 text-[10px] uppercase font-bold tracking-wider text-emerald-100">Live Twin Updated</span>
        </div>
      )}

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item, idx) => (
          <div 
            key={idx} 
            className={`rounded-xl p-4 border transition-all flex flex-col justify-between space-y-3 ${appliedActions[idx] ? 'bg-emerald-950/30 border-emerald-500/40' : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'}`}
          >
            <div className="flex items-start justify-between">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.urgency === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                {item.urgency} Priority
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{item.impact}</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-heading">{item.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.action}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handleApply(item, idx)}
                disabled={appliedActions[idx]}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${appliedActions[idx] ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'}`}
              >
                {appliedActions[idx] ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Action Applied to Digital Twin
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" /> Apply Action to Digital Twin
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
