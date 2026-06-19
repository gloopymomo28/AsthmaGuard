import { AlertTriangle, Bell, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlertFeed({ patients = [] }) {
  const navigate = useNavigate();
  
  const highRiskPatients = patients.filter(p => (p.riskScore || 25) >= 70);
  
  const dynamicAlerts = highRiskPatients.map(p => ({
    id: p.id,
    type: 'critical',
    message: `${p.name} risk crossed 70%`,
    time: p.lastUpdated || 'Recently',
    patientId: p.id
  }));

  const alerts = dynamicAlerts.length > 0 ? dynamicAlerts : [
    { id: 'info-1', type: 'info', message: 'All patients are currently stable', time: 'Just now' },
    { id: 'warn-1', type: 'warning', message: 'High pollen count in Zone A', time: '1 hour ago' },
    { id: 'info-2', type: 'info', message: 'Model retrained successfully', time: '5 hours ago' },
  ];

  return (
    <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="text-emerald-400" size={20} />
        <h3 className="font-semibold text-lg text-slate-100">Recent Alerts</h3>
      </div>
      
      <div className="space-y-4">
        {alerts.map(alert => (
          <div 
            key={alert.id} 
            onClick={() => alert.patientId && navigate(`/patient/${alert.patientId}`)}
            className={`flex gap-3 items-start pb-4 border-b border-slate-700/50 last:border-0 last:pb-0 ${alert.patientId ? 'cursor-pointer hover:bg-slate-800/60 p-2 -mx-2 rounded-xl transition-colors' : ''}`}
          >
            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
              alert.type === 'critical' ? 'bg-rose-500/10 text-rose-500' :
              alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              <AlertTriangle size={16} />
            </div>
            <div>
              <p className="text-sm text-slate-200">{alert.message}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Clock size={12} />
                {alert.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
