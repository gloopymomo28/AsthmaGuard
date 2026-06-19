import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Thermometer, CloudRain, Wind, Bug, Droplets, PawPrint, AlertCircle, FileDown } from 'lucide-react';
import { patientService, predictionService } from '../services/api';
import RiskChart from '../components/dashboard/RiskChart';
import ContributingFactors from '../components/dashboard/ContributingFactors';
import VitalsGrid from '../components/dashboard/VitalsGrid';
import VitalsChart from '../components/charts/VitalsChart';
import TreatmentSimulator from '../components/clinical/TreatmentSimulator';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [trajectory, setTrajectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [simulatedRisk, setSimulatedRisk] = useState(null);
  const pdfRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const pData = await patientService.getPatient(id);
      setPatient(pData);
      if (pData) {
        const tData = await predictionService.generateDemoPrediction();
        setTrajectory(tData);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleDemoPrediction = async () => {
    setGenerating(true);
    const newTrajectory = await predictionService.generateDemoPrediction();
    setTrajectory(newTrajectory);
    setSimulatedRisk(null);
    setTimeout(() => setGenerating(false), 800);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a', // match dark bg
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AsthmaGuard_Report_${patient.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    }
    setExporting(false);
  };

  // When risk is simulated, we modify the latest trajectory point for the dial
  const displayTrajectory = [...trajectory];
  if (simulatedRisk !== null && displayTrajectory.length > 0) {
    displayTrajectory[displayTrajectory.length - 1] = {
      ...displayTrajectory[displayTrajectory.length - 1],
      riskScore: simulatedRisk
    };
  }

  if (loading) return <div className="flex h-full items-center justify-center text-emerald-400">Loading patient data...</div>;
  if (!patient) return <div className="text-center mt-10">Patient not found</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/patients')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors border border-slate-700">
            <ArrowLeft size={20} className="text-slate-300" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{patient.name}</h2>
            <p className="text-slate-400 text-sm">
              {patient.age} yrs • {patient.sex} • Baseline FEV1: {patient.baselineFEV1}% • {patient.severity || patient.asthma_severity} Asthma
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-all disabled:opacity-70"
          >
            <FileDown size={18} className={exporting ? 'animate-pulse' : ''} />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button 
            onClick={handleDemoPrediction}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-medium rounded-xl transition-all disabled:opacity-70"
          >
            <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Running Model...' : 'Predict AI Risk'}
          </button>
        </div>
      </div>

      {/* PDF Export Container */}
      <div ref={pdfRef} className="p-4 -m-4 bg-slate-950/20 rounded-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <RiskChart data={displayTrajectory} />
            
            <TreatmentSimulator 
              patientId={patient.id} 
              currentRisk={trajectory.length > 0 ? trajectory[trajectory.length - 1].riskScore : 50} 
              onRiskUpdate={(newRisk) => setSimulatedRisk(newRisk)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContributingFactors />
              
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-slate-100 mb-6">Environmental Context</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3"><CloudRain className="text-blue-400" size={20} /><span className="text-slate-300">AQI (PM2.5)</span></div>
                    <span className="font-semibold text-rose-400">142 - Unhealthy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3"><Wind className="text-emerald-400" size={20} /><span className="text-slate-300">Pollen Level</span></div>
                    <span className="font-semibold text-amber-400">Medium</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3"><Bug className="text-slate-400" size={20} /><span className="text-slate-300">Dust Mites</span></div>
                    <span className="font-semibold text-rose-400">High</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recharts Data Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <VitalsChart 
                title="FEV1 Trend (Liters)" 
                strokeColor="#10b981" 
                domain={[1.5, 4.0]}
                referenceLines={[{ y: 2.0, color: '#f43f5e' }]} // Red line for dangerous drop
              />
              <VitalsChart 
                title="Peak Expiratory Flow (L/min)" 
                strokeColor="#3b82f6" 
                domain={[200, 600]}
                referenceLines={[{ y: 350, color: '#f59e0b' }]} // Yellow zone warning
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-slate-100 mb-4">Current Vitals</h3>
              <VitalsGrid vitals={patient.vitals} />
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-slate-100 mb-4">Clinical Tests (Baseline)</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400 text-sm">FeNO Level:</span>
                  <span className="text-slate-200 text-sm font-medium">{patient.fenoLevel || '45'} ppb</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400 text-sm">Blood Eosinophils:</span>
                  <span className="text-slate-200 text-sm font-medium">{patient.bloodEosinophils || '350'} cells/mcL</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400 text-sm">FEV1 Level:</span>
                  <span className="text-slate-200 text-sm font-medium">{patient.baselineFEV1 || '65'}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400 text-sm">ACT Score:</span>
                  <span className="text-slate-200 text-sm font-medium">{patient.actScore || '16'}/25</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-700/50">
                  <span className="text-slate-400 text-sm">Exacerbations (1yr):</span>
                  <span className="text-slate-200 text-sm font-medium">{patient.exacerbations || '2'}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="font-semibold text-lg text-slate-100 mb-4">Clinical Notes</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {patient.notes || "Patient missed two doses of inhaled corticosteroid this week. Reported slight wheezing upon waking up."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
