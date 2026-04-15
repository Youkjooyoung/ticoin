import { create } from 'zustand';
import { alertApi } from '../api/market.js';

export const useAlertStore = create((set, get) => ({
  items: [],
  triggered: [],
  loading: false,

  load: async () => {
    set({ loading: true });
    try {
      const data = await alertApi.list();
      set({ items: data ?? [], loading: false });
    } catch {
      set({ items: [], loading: false });
    }
  },

  create: async (payload) => {
    const created = await alertApi.create(payload);
    set((s) => ({ items: [created, ...s.items] }));
    return created;
  },

  remove: async (id) => {
    try { await alertApi.delete(id); } catch {}
    set((s) => ({
      items: s.items.filter((x) => x.id !== id),
      triggered: s.triggered.filter((x) => x.id !== id),
    }));
  },

  pushTriggered: (evt) => {
    set((s) => ({
      triggered: [evt, ...s.triggered].slice(0, 5),
      items: s.items.map((a) =>
        a.id === evt.id ? { ...a, triggered: true, triggeredAt: evt.triggeredAt } : a
      ),
    }));
  },

  clearTriggered: () => set({ triggered: [] }),
}));
