import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://asthmaguard.onrender.com/api',
});

// Mock data fallback if backend is unavailable
const mockPatients = [];

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
  },

  deletePatient: async (id) => {
    try {
      await api.delete(`/patients/${id}`);
      return true;
    } catch (error) {
      console.warn('Failed to delete patient', error);
      return false;
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
