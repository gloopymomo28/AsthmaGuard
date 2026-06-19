import React, { useState } from 'react';
import { Pill, Activity, Zap, Info } from 'lucide-react';

export default function TreatmentSimulator({ patientId, currentRisk, onRiskUpdate }) {
  const [loading, setLoading] = useState(false);
  const [activeTreatments, setActiveTreatments] = useState([]);

  const treatments = [
    { id: 'ics_laba', name: 'Increase ICS/LABA', impact: 'Lowers inflammation, improves FEV1', icon: <Pill size={16}/> },
    { id: 'biologic', name: 'Anti-IL5 Biologic', impact: 'Drastically lowers blood eosinophils', icon: <Activity size={16}/> },
    { id: 'ocs', name: 'Short-course OCS', impact: 'Rapid symptom relief, high side effects', icon: <Zap size={16}/> }
  ];

  const handleToggleTreatment = async (treatmentId) => {
    setLoading(true);
    let newTreatments = [...activeTreatments];
    
    if (newTreatments.includes(treatmentId)) {
      newTreatments = newTreatments.filter(id => id !== treatmentId);
    } else {
      newTreatments.push(treatmentId);
    }
    
    setActiveTreatments(newTreatments);

    try {
      // In a real app, this would send the specific treatment array to the backend
      // and the backend would use its neural network to calculate the new risk.
      // For this simulator demo, we will call a mock prediction or calculate locally.
      
      let simulatedRisk = currentRisk;
      
      // Simulate Risk Reduction based on biological mechanics
      if (newTreatments.includes('ics_laba')) simulatedRisk -= 15;
      if (newTreatments.includes('biologic')) simulatedRisk -= 25;
      if (newTreatments.includes('ocs')) simulatedRisk -= 30;
      
      // Base risk drift if no treatments
      if (newTreatments.length === 0) simulatedRisk = currentRisk;

      // Floor the risk at 5%
      const finalRisk = Math.max(5, simulatedRisk);

      // We use a timeout to simulate the AI PyTorch inference delay
      setTimeout(() => {
        onRiskUpdate(finalRisk);
        setLoading(false);
      }, 1200);

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg">
          <Zap className="text-indigo-400 w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">AI Treatment Simulator</h2>
          <p className="text-xs text-slate-400">Preview clinical outcomes via PyTorch inference</p>
        </div>
      </div>

      <div className="space-y-3">
        {treatments.map((t) => {
          const isActive = activeTreatments.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => handleToggleTreatment(t.id)}
              disabled={loading}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-indigo-500/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                  : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                  {t.icon}
                </div>
                <div className="text-left">
                  <div className={`font-medium text-sm ${isActive ? 'text-indigo-200' : 'text-slate-300'}`}>
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Info size={12} /> {t.impact}
                  </div>
                </div>
              </div>
              
              <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </button>
          );
        })}
      </div>
      
      {loading && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800 rounded-full border border-indigo-500/30 shadow-xl">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-medium text-indigo-300">Recalculating Risk Vector...</span>
          </div>
        </div>
      )}
    </div>
  );
}
