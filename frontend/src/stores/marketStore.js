import { create } from 'zustand';
import { marketApi } from '../api/market.js';

export const useMarketStore = create((set, get) => ({
  feed: [],
  coins: [],
  stocks: [],
  trending: [],
  loading: false,
  error: null,

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
      set({ coins: FALLBACK_FEED.filter((a) => a.type === 'CRYPTO') });
    }
  },

  loadStocks: async () => {
    try {
      const data = await marketApi.stocks();
      set({ stocks: data });
    } catch {
      set({ stocks: FALLBACK_FEED.filter((a) => a.type === 'STOCK') });
    }
  },

  loadTrending: async () => {
    try {
      const data = await marketApi.trending();
      set({ trending: data });
    } catch {
      set({ trending: FALLBACK_FEED.slice(0, 5) });
    }
  },
}));

const FALLBACK_FEED = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 67234.12, change24h: 2112.45, changePercent24h: 3.24, marketCap: 1.32e12, volume24h: 28.5e9, high24h: 67890, low24h: 65100, sparkline: [] },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', price: 3456.78, change24h: 73.89, changePercent24h: 2.18, marketCap: 415e9, volume24h: 18.2e9, high24h: 3512, low24h: 3380, sparkline: [] },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', price: 178.45, change24h: 13.92, changePercent24h: 8.45, marketCap: 82e9, volume24h: 3.4e9, high24h: 181, low24h: 164, sparkline: [] },
  { symbol: 'ADA', name: 'Cardano', type: 'CRYPTO', price: 0.472, change24h: -0.010, changePercent24h: -2.14, marketCap: 16.5e9, volume24h: 620e6, high24h: 0.488, low24h: 0.465, sparkline: [] },
  { symbol: 'AAPL', name: 'Apple', type: 'STOCK', price: 228.32, change24h: -2.84, changePercent24h: -1.23, marketCap: 3.5e12, volume24h: 54.2e6, high24h: 231.5, low24h: 227.8, sparkline: [] },
  { symbol: 'TSLA', name: 'Tesla', type: 'STOCK', price: 421.88, change24h: 22.63, changePercent24h: 5.67, marketCap: 1.34e12, volume24h: 98.4e6, high24h: 427, low24h: 405, sparkline: [] },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'STOCK', price: 145.22, change24h: 6.01, changePercent24h: 4.32, marketCap: 3.57e12, volume24h: 245.8e6, high24h: 146, low24h: 141, sparkline: [] },
  { symbol: 'MSFT', name: 'Microsoft', type: 'STOCK', price: 432.56, change24h: 8.02, changePercent24h: 1.89, marketCap: 3.22e12, volume24h: 22.1e6, high24h: 434, low24h: 428, sparkline: [] },
];
