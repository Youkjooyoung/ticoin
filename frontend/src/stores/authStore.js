import { create } from 'zustand';
import api from '../api/axios.js';

const TOKEN_KEY = 'ticoin.token';

function readStoredToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export const useAuthStore = create((set, get) => ({
  token: readStoredToken(),
  user: null,
  providers: [],
  guestMode: true,
  loading: false,

  loadProviders: async () => {
    try {
      const res = await api.get('/auth/providers');
      set({ providers: res.data.providers ?? [], guestMode: res.data.guestMode ?? true });
    } catch (e) {
      set({ providers: [], guestMode: true });
    }
  },

  loadMe: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null });
      return;
    }
    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      if (res.data?.authenticated) {
        set({ user: res.data.user, loading: false });
      } else {
        set({ user: null, loading: false });
        get().setToken(null);
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  setToken: (token) => {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
    set({ token });
  },

  loginWith: (loginUrl) => {
    window.location.href = loginUrl;
  },

  logout: () => {
    get().setToken(null);
    set({ user: null });
  },

  isAuthenticated: () => !!get().token && !!get().user,
}));
