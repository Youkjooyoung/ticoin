import { create } from 'zustand';
import { marketApi } from '../api/market.js';

const FALLBACK_FEED = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 67234.12, change24h: 2112.45, changePercent24h: 3.24, marketCap: 1.32e12, volume24h: 28.5e9, high24h: 67890, low24h: 65100, sparkline: [] },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', price: 3456.78, change24h: 73.89, changePercent24h: 2.18, marketCap: 415e9, volume24h: 18.2e9, high24h: 3512, low24h: 3380, sparkline: [] },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', price: 178.45, change24h: 13.92, changePercent24h: 8.45, marketCap: 82e9, volume24h: 3.4e9, high24h: 181, low24h: 164, sparkline: [] },
  { symbol: 'ADA', name: 'Cardano', type: 'CRYPTO', price: 0.472, change24h: -0.010, changePercent24h: -2.14, marketCap: 16.5e9, volume24h: 620e6, high24h: 0.488, low24h: 0.465, sparkline: [] },
];

export const useMarketStore = create((set, get) => ({
  feed: [],
  coins: [],
  stocks: [],
  trending: [],
  loading: false,
  error: null,
  flashes: {},

  loadFeed: async () => {
    set({ loading: true, error: null });
    try {
      const data = await marketApi.feed();
      set({ feed: data, loading: false });
    } catch (e) {
      set({ error: e?.message ?? 'error', loading: false, feed: FALLBACK_FEED });
    }
  },

  loadCoins: async () => {
    try {
      const data = await marketApi.coins();
      set({ coins: data });
    } catch {
      set({ coins: FALLBACK_FEED });
    }
  },

  loadStocks: async () => {
    try {
      const data = await marketApi.stocks();
      set({ stocks: data });
    } catch {
      set({ stocks: [] });
    }
  },

  loadTrending: async () => {
    try {
      const data = await marketApi.trending();
      set({ trending: data });
    } catch {
      set({ trending: FALLBACK_FEED.slice(0, 4) });
    }
  },

  updatePrice: (symbol, newPrice) => {
    const cur = get().feed;
    let flashDir = null;
    const next = cur.map((a) => {
      if (a.symbol !== symbol) return a;
      if (a.price != null && a.price !== newPrice) {
        flashDir = newPrice > a.price ? 'up' : 'down';
      }
      const base = a.price - (a.change24h ?? 0);
      return {
        ...a,
        price: newPrice,
        change24h: newPrice - base,
        changePercent24h: base ? ((newPrice - base) / base) * 100 : 0,
      };
    });
    if (flashDir) {
      const flashes = { ...get().flashes, [symbol]: flashDir };
      set({ feed: next, flashes });
      setTimeout(() => {
        const state = get();
        const cleared = { ...state.flashes };
        delete cleared[symbol];
        set({ flashes: cleared });
      }, 600);
    } else {
      set({ feed: next });
    }
  },

  mergeFeed: (incoming) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    const prev = new Map(get().feed.map((a) => [a.symbol, a]));
    const flashes = { ...get().flashes };
    const changedSymbols = [];
    const merged = incoming.map((a) => {
      const p = prev.get(a.symbol);
      if (p && p.price != null && a.price != null && p.price !== a.price) {
        flashes[a.symbol] = a.price > p.price ? 'up' : 'down';
        changedSymbols.push(a.symbol);
      }
      return { ...p, ...a };
    });
    const incomingSymbols = new Set(incoming.map((a) => a.symbol));
    for (const p of prev.values()) {
      if (!incomingSymbols.has(p.symbol)) merged.push(p);
    }
    set({ feed: merged, flashes });
    if (changedSymbols.length > 0) {
      setTimeout(() => {
        const state = get();
        const cleared = { ...state.flashes };
        for (const s of changedSymbols) delete cleared[s];
        set({ flashes: cleared });
      }, 900);
    }
  },
}));
