import axios from 'axios';
import { getDeviceId } from '../lib/device.js';

const TOKEN_KEY = 'ticoin.token';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['X-Device-Id'] = getDeviceId();
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url;
    const status = err?.response?.status;
    const data = err?.response?.data;
    if (status === 401 && typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    console.warn('[api error]', url, status, data?.message ?? err?.message);
    return Promise.reject(err);
  }
);

export default api;
