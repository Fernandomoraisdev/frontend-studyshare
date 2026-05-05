import axios from 'axios';

const PRODUCTION_API_URL = 'https://happy-determination-production-5d70.up.railway.app';
const DEPRECATED_API_HOST = 'studyshare-backend-production-efa7.up.railway.app';

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || '';
const baseURL = configuredBaseURL.includes(DEPRECATED_API_HOST)
  ? PRODUCTION_API_URL
  : configuredBaseURL;

const api = axios.create({
  baseURL,
  timeout: 7000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
