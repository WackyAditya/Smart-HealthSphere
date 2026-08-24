import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // If running locally in development
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api';
  }
  // When running on public deployment (ShipStatic, etc.)
  return 'https://smart-health-backend.loca.lt/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  try {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      } else if (user && user.data && user.data.token) {
        config.headers.Authorization = `Bearer ${user.data.token}`;
      }
    }
  } catch (e) {
    console.error('Error attaching auth token:', e);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
