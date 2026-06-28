import { useState, useEffect } from 'react';
import { Users, AlertTriangle, Activity, Brain } from 'lucide-react';
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
                <PatientCard key={patient.id} patient={patient} />
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
