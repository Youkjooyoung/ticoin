import api from './axios.js';

export const marketApi = {
  feed: () => api.get('/market/feed').then((r) => r.data),
  coins: () => api.get('/market/coins').then((r) => r.data),
  stocks: () => api.get('/market/stocks').then((r) => r.data),
  trending: () => api.get('/market/trending').then((r) => r.data),
  candles: (symbol, type = 'CRYPTO', interval = '1D') =>
    api.get('/market/candles', { params: { symbol, type, interval } }).then((r) => r.data),
  search: (q) => api.get('/market/search', { params: { q } }).then((r) => r.data),
};

export const newsApi = {
  list: (category) =>
    api.get('/news', { params: category ? { category } : {} }).then((r) => r.data),
};

export const portfolioApi = {
  list: () => api.get('/portfolio').then((r) => r.data),
  create: (p) => api.post('/portfolio', p).then((r) => r.data),
  delete: (id) => api.delete(`/portfolio/${id}`).then((r) => r.data),
};

export const watchlistApi = {
  list: () => api.get('/watchlist').then((r) => r.data),
  create: (w) => api.post('/watchlist', w).then((r) => r.data),
  toggleAlert: (id) => api.patch(`/watchlist/${id}/alert`).then((r) => r.data),
  delete: (id) => api.delete(`/watchlist/${id}`).then((r) => r.data),
};

export const alertApi = {
  list: () => api.get('/alerts').then((r) => r.data),
  create: (a) => api.post('/alerts', a).then((r) => r.data),
  delete: (id) => api.delete(`/alerts/${id}`).then((r) => r.data),
};
