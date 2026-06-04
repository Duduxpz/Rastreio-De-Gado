import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const endpoints = {
  animais: {
    list: () => api.get('/api/animais'),
    get: (id: string) => api.get(`/api/animais/${id}`),
    create: (data: any) => api.post('/api/animais', data),
    update: (id: string, data: any) => api.put(`/api/animais/${id}`, data),
  },
  vacinacoes: {
    list: (animalId: string) => api.get(`/api/vacinacoes?animal_id=${animalId}`),
    create: (data: any) => api.post('/api/vacinacoes', data),
  },
  pesagens: {
    list: (animalId: string) => api.get(`/api/pesagens?animal_id=${animalId}`),
    create: (data: any) => api.post('/api/pesagens', data),
  },
  sync: {
    push: (payload: any) => api.post('/api/sync/push', payload),
  },
};
