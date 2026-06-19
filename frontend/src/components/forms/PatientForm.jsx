import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';

export default function PatientForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'Male',
    weight: '',
    height: '',
    severity: 'Mild Intermittent',
    baselineFEV1: '',
    smokingStatus: 'Never Smoked',
    fenoLevel: '',
    bloodEosinophils: '',
    fvc: '',
    fev1FvcRatio: '',
    methacholine: 'Negative',
    actScore: '',
    exacerbations: '',
    comorbidities: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Add mock data for missing fields required by the UI
    const payload = {
      name: formData.name,
      age: Number(formData.age),
      sex: formData.sex,
      weight_kg: Number(formData.weight) || 70.0,
      height_cm: Number(formData.height) || 170.0,
      asthma_severity: formData.severity,
      baseline_fev1_percent: Number(formData.baselineFEV1),
      smoking_status: formData.smokingStatus,
      feno_level: Number(formData.fenoLevel) || 0,
      blood_eosinophils: Number(formData.bloodEosinophils) || 0,
      fvc: Number(formData.fvc) || 0,
      fev1_fvc_ratio: Number(formData.fev1FvcRatio) || 0,
      methacholine_pc20: formData.methacholine.includes('Positive') ? 3.0 : 0.0,
      act_score: Number(formData.actScore) || 25,
      exacerbations_last_year: Number(formData.exacerbations) || 0,
      comorbidities: formData.comorbidities ? formData.comorbidities.split(',').map(s => s.trim()) : [],
      allergies: [],
      // Frontend specific mock fields
      riskScore: Math.floor(Math.random() * 40) + 10,
      lastUpdated: 'Just now',
      trend: [20, 25, 22, 28],
      vitals: { 
        hr: 75, 
        rr: 14, 
        spo2: 98, 
        pef: 350,
        pefPercent: 75,
        activityLevel: 'Moderate',
        symptomScore: 2,
        inhalerUsage: 1
      }
    };
    
    const newPatient = await patientService.createPatient(payload);
    setLoading(false);
    navigate(`/patient/${newPatient.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Demographics */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-slate-700/50 pb-2">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <input 
              required
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Age</label>
              <input 
                required
                type="number" 
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Sex</label>
              <select 
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-slate-700/50 pb-2">Clinical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Asthma Severity</label>
            <select 
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            >
              <option>Mild Intermittent</option>
              <option>Mild Persistent</option>
              <option>Moderate Persistent</option>
              <option>Severe Persistent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Baseline FEV1 (%)</label>
            <input 
              required
              type="number" 
              name="baselineFEV1"
              value={formData.baselineFEV1}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 85"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Smoking Status</label>
            <select 
              name="smokingStatus"
              value={formData.smokingStatus}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            >
              <option>Never Smoked</option>
              <option>Former Smoker</option>
              <option>Current Smoker</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clinical Tests / Baseline Data */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-emerald-400 mb-4 border-b border-slate-700/50 pb-2">Clinical Tests & Baseline Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">FeNO Level (ppb)</label>
            <input 
              type="number" 
              name="fenoLevel"
              value={formData.fenoLevel}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 45"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Blood Eosinophils (cells/mcL)</label>
            <input 
              type="number" 
              name="bloodEosinophils"
              value={formData.bloodEosinophils}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 350"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">FVC (L)</label>
            <input 
              type="number" 
              name="fvc"
              step="0.1"
              value={formData.fvc}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 3.2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">FEV1/FVC Ratio (%)</label>
            <input 
              type="number" 
              name="fev1FvcRatio"
              value={formData.fev1FvcRatio}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 72"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Methacholine Challenge</label>
            <select 
              name="methacholine"
              value={formData.methacholine}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            >
              <option>Negative</option>
              <option>Positive (PC20 {'<'} 4mg/mL)</option>
              <option>Positive (PC20 4-16mg/mL)</option>
              <option>Borderline</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">ACT Score</label>
            <input 
              type="number" 
              name="actScore"
              value={formData.actScore}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 16"
              min="5"
              max="25"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Exacerbations (last year)</label>
            <input 
              type="number" 
              name="exacerbations"
              value={formData.exacerbations}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. 2"
              min="0"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-400 mb-2">Comorbidities</label>
            <input 
              type="text" 
              name="comorbidities"
              value={formData.comorbidities}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              placeholder="e.g. Obesity, Allergic Rhinitis, Anxiety"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button 
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium rounded-xl transition-all disabled:opacity-70 flex items-center gap-2"
        >
          {loading ? 'Saving...' : 'Add Patient'}
        </button>
      </div>
    </form>
  );
}
