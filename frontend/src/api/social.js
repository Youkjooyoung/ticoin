import api from './axios.js';

export const postApi = {
  list: (params = {}) => api.get('/posts', { params }).then((r) => r.data),
  create: (payload) => api.post('/posts', payload).then((r) => r.data),
  delete: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
  toggleLike: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
};

export const authApi = {
  providers: () => api.get('/auth/providers').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};
