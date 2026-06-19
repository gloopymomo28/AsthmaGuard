import { useState, useEffect } from 'react';
import AlertFeed from '../components/dashboard/AlertFeed';
import { patientService } from '../services/api';

export default function Alerts() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">System Alerts</h2>
        <p className="text-slate-400">Full log of AI-generated clinical alerts and environmental notifications.</p>
      </header>
      
      <div className="bg-slate-800/20 border border-slate-700/50 rounded-2xl">
        <AlertFeed patients={patients} />
      </div>
    </div>
  );
}
