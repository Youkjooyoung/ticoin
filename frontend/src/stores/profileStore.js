import { create } from 'zustand';
import api from '../api/axios.js';

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/profile');
      set({ profile: res.data, loading: false });
    } catch {
      set({ profile: null, loading: false });
    }
  },

  update: async (payload) => {
    const res = await api.put('/profile', payload);
    set({ profile: res.data });
    return res.data;
  },
}));
