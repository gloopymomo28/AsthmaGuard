import { useNavigate } from 'react-router-dom';
import { Activity, Clock, Trash2 } from 'lucide-react';

export default function PatientCard({ patient, onDelete }) {
  const navigate = useNavigate();
  const riskScore = patient.riskScore || 25;
  const trend = patient.trend || [20, 22, 25, 25];
  const lastUpdated = patient.lastUpdated || 'Recently';

  const isHighRisk = riskScore >= 70;
  const isWarning = riskScore >= 40 && riskScore < 70;

  const getRiskColor = () => {
    if (isHighRisk) return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (isWarning) return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  };

  return (
    <div 
      onClick={() => navigate(`/patient/${patient.id}`)}
      className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 cursor-pointer hover:bg-slate-800/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/20 transition-all group relative"
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(patient.id); }}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-700/0 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100"
          title="Remove patient"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">{patient.name}</h4>
          <p className="text-sm text-slate-400">
            {patient.age}y • {patient.sex} • {patient.severity || patient.asthma_severity}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-bold flex items-center gap-1 ${getRiskColor()}`}>
          <Activity size={14} />
          {riskScore}%
        </div>
      </div>

      {/* Mini sparkline visualization placeholder */}
      <div className="h-12 w-full flex items-end gap-1 mb-4">
        {trend.map((val, i) => (
          <div 
            key={i}
            className={`flex-1 rounded-t-sm opacity-60 ${
              val >= 70 ? 'bg-rose-500' : val >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ height: `${val}%` }}
          />
        ))}
      </div>

      <div className="flex items-center text-xs text-slate-500 gap-1.5 mt-auto">
        <Clock size={12} />
        Updated {lastUpdated}
      </div>
    </div>
  );
}
