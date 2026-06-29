import axios from 'axios';
import API_URL from '../constants/Api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// In-memory cache (works in Expo Go without native modules)
const cache = new Map<string, any>();

// Mock data fallback (mirrors web frontend)
const mockPatients: any[] = [];

export const patientService = {
  getPatients: async (): Promise<any[]> => {
    try {
      const response = await api.get('/patients');
      cache.set('patients', response.data);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, falling back to local cache', error);
      const cached = cache.get('patients');
      if (cached) return cached;
      return [];
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
