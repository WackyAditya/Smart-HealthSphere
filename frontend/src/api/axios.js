import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  return '/api';
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
