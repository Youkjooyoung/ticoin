import { create } from 'zustand';

let idSeq = 1;

export const useToastStore = create((set, get) => ({
  toasts: [],
  push: (type, message, duration = 3000) => {
    const id = idSeq++;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => get().dismiss(id), duration);
  },
  success: (message, duration) => get().push('success', message, duration),
  error: (message, duration) => get().push('error', message, duration),
  info: (message, duration) => get().push('info', message, duration),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
