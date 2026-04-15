import axios from 'axios';
import { getDeviceId } from '../lib/device.js';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers['X-Device-Id'] = getDeviceId();
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err?.config?.url;
    const status = err?.response?.status;
    const data = err?.response?.data;
    console.warn('[api error]', url, status, data?.message ?? err?.message);
    return Promise.reject(err);
  }
);

export default api;
