import axios from 'axios';
import API_URL from '../constants/Api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// Mock data fallback (mirrors web frontend)
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
    vitals: { hr: 78, rr: 16, spo2: 98, pef: 320 },
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
    vitals: { hr: 95, rr: 22, spo2: 93, pef: 240 },
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
    vitals: { hr: 72, rr: 14, spo2: 99, pef: 410 },
  },
];

export const patientService = {
  getPatients: async (): Promise<any[]> => {
    try {
      const response = await api.get('/patients');
      return response.data;
    } catch {
      console.warn('Backend unavailable, using mock data');
      return mockPatients;
    }
  },

  getPatient: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch {
      return mockPatients.find((p) => p.id === id) || mockPatients[0];
    }
  },
};

export const predictionService = {
  generateDemoPrediction: async (): Promise<any> => {
    try {
      const response = await api.post('/predictions/demo');
      return response.data;
    } catch {
      return {
        risk_scores: Array.from({ length: 30 }, (_, i) =>
          Math.max(0, Math.min(100, 30 + Math.random() * 50 + (i > 15 ? 30 : 0)))
        ),
        alert_level: 'Medium',
        contributing_factors: {
          environmental: 0.35,
          physiological: 0.45,
          clinical: 0.2,
        },
      };
    }
  },
};

export const authService = {
  sendMagicLink: async (email: string) => {
    const response = await api.post('/auth/send-magic-link', { email });
    return response.data;
  },

  verifyToken: async (token: string, email: string) => {
    const response = await api.post('/auth/verify', { token, email });
    return response.data;
  },
};

export default api;
