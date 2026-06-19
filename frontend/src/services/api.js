import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Mock data fallback if backend is unavailable
const mockPatients = [
  {
    id: '1',
    name: 'Eleanor Vance',
    age: 42,
    sex: 'Female',
    severity: 'Moderate',
    baselineFEV1: 82,
    riskScore: 35,
    lastUpdated: '10 mins ago',
    trend: [25, 30, 28, 35],
    vitals: { hr: 78, rr: 16, spo2: 98, pef: 320 }
  },
  {
    id: '2',
    name: 'Marcus Thorne',
    age: 28,
    sex: 'Male',
    severity: 'Severe',
    baselineFEV1: 65,
    riskScore: 78,
    lastUpdated: '2 mins ago',
    trend: [45, 60, 72, 78],
    vitals: { hr: 95, rr: 22, spo2: 93, pef: 240 }
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    age: 35,
    sex: 'Female',
    severity: 'Mild',
    baselineFEV1: 95,
    riskScore: 12,
    lastUpdated: '1 hour ago',
    trend: [10, 15, 12, 12],
    vitals: { hr: 72, rr: 14, spo2: 99, pef: 410 }
  }
];

export const patientService = {
  getPatients: async () => {
    try {
      const response = await api.get('/patients');
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using mock data');
      return mockPatients;
    }
  },
  
  getPatient: async (id) => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      return mockPatients.find(p => p.id === id);
    }
  },

  createPatient: async (data) => {
    try {
      const response = await api.post('/patients', data);
      return response.data;
    } catch (error) {
      return { id: Math.random().toString(36).substr(2, 9), ...data };
    }
  }
};

export const predictionService = {
  getPrediction: async (patientId) => {
    try {
      const response = await api.get(`/predictions/${patientId}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  generateDemoPrediction: async () => {
    try {
      const response = await api.post('/predictions/demo');
      return response.data;
    } catch (error) {
      // Mock trajectory for demo
      return Array.from({length: 24}, (_, i) => ({
        time: `${i}:00`,
        risk: Math.max(0, Math.min(100, 30 + Math.random() * 50 + (i > 12 ? 30 : 0)))
      }));
    }
  }
};
