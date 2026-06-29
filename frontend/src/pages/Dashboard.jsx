import { useState, useEffect } from 'react';
import { Users, AlertTriangle, Activity, Brain, Cpu, Trash2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import PatientCard from '../components/dashboard/PatientCard';
import AlertFeed from '../components/dashboard/AlertFeed';
import { patientService } from '../services/api';
import { useAlertSocket } from '../hooks/useAlertSocket';

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time WebSocket hook
  const lastAlert = useAlertSocket();

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  // Update patient list dynamically if an alert comes in
  useEffect(() => {
    if (lastAlert) {
      setPatients(prev => {
        const index = prev.findIndex(p => p.id === lastAlert.patient_id);
        if (index === -1) return prev;
        
        const newPatients = [...prev];
        const risk = Math.round(lastAlert.risk_scores[lastAlert.risk_scores.length - 1] * 100);
        newPatients[index] = { ...newPatients[index], riskScore: risk, lastUpdated: 'Just now' };
        return newPatients;
      });
    }
  }, [lastAlert]);

  const highRiskCount = patients.filter(p => p.riskScore >= 70).length;

  const handleDeletePatient = async (id) => {
    if (!window.confirm('Are you sure you want to remove this patient?')) return;
    const success = await patientService.deletePatient(id);
    if (success) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">Overview</h2>
        <p className="text-slate-400">Monitor your patients' asthma flare-up risks in real-time.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Patients" 
          value={patients.length || '--'} 
          icon={Users} 
          trend="12%" 
          trendUp={true} 
          colorClass="text-blue-400"
        />
        <StatsCard 
          title="High Risk" 
          value={loading ? '--' : highRiskCount} 
          icon={AlertTriangle} 
          trend="2" 
          trendUp={false}
          colorClass="text-rose-400"
        />
        <StatsCard 
          title="Alerts Today" 
          value="14" 
          icon={Activity} 
          trend="5%" 
          trendUp={false}
          colorClass="text-amber-400"
        />
        <StatsCard 
          title="Model Accuracy" 
          value="94.2%" 
          icon={Brain} 
          trend="1.2%" 
          trendUp={true}
          colorClass="text-emerald-400"
        />
      </div>

      {/* CAMP-Trained PatchTST Model Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 p-5 flex items-center gap-4 shadow-lg shadow-emerald-900/20">
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
          <Cpu size={28} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-base">CAMP-Trained PatchTST Model</h3>
          <p className="text-white/70 text-sm">695 patients | Val Loss: 2.18</p>
        </div>
        <span className="px-3 py-1 bg-white/20 rounded-lg text-white text-xs font-bold tracking-wider">LIVE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-semibold text-slate-100">Monitored Patients</h3>
            <button className="text-sm text-emerald-400 hover:text-emerald-300">View All</button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-800/20 animate-pulse rounded-2xl border border-slate-700/50"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {patients.map(patient => (
                <PatientCard key={patient.id} patient={patient} onDelete={handleDeletePatient} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <AlertFeed patients={patients} />
        </div>
      </div>
    </div>
  );
}
