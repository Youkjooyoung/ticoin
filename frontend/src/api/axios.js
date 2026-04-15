import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.warn('[api error]', err?.config?.url, err?.message);
    return Promise.reject(err);
  }
);

export default api;
