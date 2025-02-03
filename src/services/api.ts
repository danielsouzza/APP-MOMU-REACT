import axios from 'axios';
import { useAuthStore } from '../stores/auth';

export const api = axios.create({
  baseURL: 'https://momu.com.br/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // Timeout de 10 segundos
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error: Error) => {
    if ('code' in error && error.code === 'ERR_NETWORK') {
      console.error('Network Error - Verifique sua conexão ou a URL da API');
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
); 