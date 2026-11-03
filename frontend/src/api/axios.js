import axios from 'axios';

const getBaseURL = () => {
  // If running locally in development on localhost or 127.0.0.1
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return import.meta.env.VITE_LOCAL_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5006/api';
  }
  // When running on public deployment (ShipStatic, custom domain, etc.)
  // Connected via secure Cloudflare Tunnel
  return import.meta.env.VITE_PUBLIC_API_URL || 'https://purchase-kind-blvd-forget.trycloudflare.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
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
