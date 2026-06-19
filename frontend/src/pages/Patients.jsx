import { useState, useEffect } from 'react';
import PatientCard from '../components/dashboard/PatientCard';
import { patientService } from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-100">All Patients Directory</h2>
        <p className="text-slate-400">Complete list of registered patients and their current risk status.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-slate-800/20 animate-pulse rounded-2xl border border-slate-700/50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
}
