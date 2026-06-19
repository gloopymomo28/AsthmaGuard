import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatientForm from '../components/forms/PatientForm';

export default function NewPatient() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors border border-slate-700"
        >
          <ArrowLeft size={20} className="text-slate-300" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <UserPlus className="text-emerald-400" />
            Add New Patient
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Register a new patient for continuous AI monitoring.
          </p>
        </div>
      </div>

      <PatientForm />
    </div>
  );
}
