import { create } from 'zustand';
import { marketApi } from '../api/market.js';

const FALLBACK_FEED = [
  { symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', price: 67234.12, change24h: 2112.45, changePercent24h: 3.24, marketCap: 1.32e12, volume24h: 28.5e9, high24h: 67890, low24h: 65100, sparkline: [] },
  { symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', price: 3456.78, change24h: 73.89, changePercent24h: 2.18, marketCap: 415e9, volume24h: 18.2e9, high24h: 3512, low24h: 3380, sparkline: [] },
  { symbol: 'XRP', name: 'XRP', type: 'CRYPTO', price: 0.62, change24h: -0.01, changePercent24h: -1.34, marketCap: 34e9, volume24h: 1.8e9, high24h: 0.64, low24h: 0.61, sparkline: [] },
  { symbol: 'SOL', name: 'Solana', type: 'CRYPTO', price: 178.45, change24h: 13.92, changePercent24h: 8.45, marketCap: 82e9, volume24h: 3.4e9, high24h: 181, low24h: 164, sparkline: [] },
  { symbol: 'ADA', name: 'Cardano', type: 'CRYPTO', price: 0.472, change24h: -0.010, changePercent24h: -2.14, marketCap: 16.5e9, volume24h: 620e6, high24h: 0.488, low24h: 0.465, sparkline: [] },
  { symbol: 'DOGE', name: 'Dogecoin', type: 'CRYPTO', price: 0.158, change24h: -0.005, changePercent24h: -3.12, marketCap: 23e9, volume24h: 1.1e9, high24h: 0.164, low24h: 0.155, sparkline: [] },
];

const FALLBACK_SYMBOLS = FALLBACK_FEED.map((asset) => asset.symbol);

function normalizeAsset(asset) {
  if (!asset) return asset;
  if (asset.type !== 'CRYPTO') return asset;
  let symbol = String(asset.symbol || '').toUpperCase();
  if (symbol.includes('-')) symbol = symbol.split('-').at(-1);
  if (symbol.includes('/')) symbol = symbol.split('/')[0];
  return { ...asset, symbol };
}

function mergeAsset(asset, update) {
  const price = update.price ?? asset.price;
  const base = asset.price != null && asset.change24h != null ? asset.price - asset.change24h : null;
  const change24h = update.change24h ?? (base ? price - base : asset.change24h);
  const changePercent24h = update.changePercent24h ?? (base ? ((price - base) / base) * 100 : asset.changePercent24h);
  return {
    ...asset,
    price,
    change24h,
    changePercent24h,
    high24h: update.high24h ?? asset.high24h,
    low24h: update.low24h ?? asset.low24h,
    volume24h: update.volume24h ?? asset.volume24h,
  };
}

function updateList(list, symbol, update) {
  let changed = false;
  const next = list.map((asset) => {
    if (asset.symbol !== symbol) return asset;
    changed = true;
    return mergeAsset(asset, update);
  });
  return changed ? next : list;
}

function updateListBulk(list, updates) {
  if (!list.length || updates.size === 0) return list;
  let changed = false;
  const next = list.map((asset) => {
    const update = updates.get(asset.symbol);
    if (!update) return asset;
    changed = true;
    return mergeAsset(asset, update);
  });
  return changed ? next : list;
}

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
      const feed = Array.isArray(data) && data.length > 0 ? data.map(normalizeAsset) : FALLBACK_FEED;
      set({ feed, loading: false });
    } catch (e) {
      set({ error: e?.message ?? 'error', loading: false, feed: FALLBACK_FEED });
    }
  },

  loadCoins: async () => {
    try {
      const data = await marketApi.coins();
      set({ coins: Array.isArray(data) && data.length > 0 ? data.map(normalizeAsset) : FALLBACK_FEED });
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
      set({ trending: Array.isArray(data) && data.length > 0 ? data.map(normalizeAsset) : FALLBACK_FEED.slice(0, 4) });
    } catch {
      set({ trending: FALLBACK_FEED.slice(0, 4) });
    }
  },

  updatePrice: (symbol, update) => {
    const normalized = normalizeAsset({ symbol, type: 'CRYPTO' }).symbol;
    const payload = typeof update === 'number' ? { price: update } : update;
    const current = get().feed.find((asset) => asset.symbol === normalized)
      || get().coins.find((asset) => asset.symbol === normalized)
      || get().trending.find((asset) => asset.symbol === normalized);
    const flashDir = current?.price != null && payload.price != null && current.price !== payload.price
      ? payload.price > current.price ? 'up' : 'down'
      : null;

    set((state) => ({
      feed: updateList(state.feed, normalized, payload),
      coins: updateList(state.coins, normalized, payload),
      trending: updateList(state.trending, normalized, payload),
      flashes: flashDir ? { ...state.flashes, [normalized]: flashDir } : state.flashes,
    }));

    if (flashDir) {
      setTimeout(() => {
        const state = get();
        const flashes = { ...state.flashes };
        delete flashes[normalized];
        set({ flashes });
      }, 700);
    }
  },

  bulkUpdatePrices: (updates) => {
    if (!Array.isArray(updates) || updates.length === 0) return;
    const normalizedUpdates = new Map();
    const state = get();
    const previous = new Map([
      ...state.feed,
      ...state.coins,
      ...state.trending,
    ].map((asset) => [asset.symbol, asset]));
    const flashes = { ...state.flashes };
    const changedSymbols = [];

    for (const update of updates) {
      const normalized = normalizeAsset({ symbol: update.symbol, type: 'CRYPTO' }).symbol;
      normalizedUpdates.set(normalized, update);
      const current = previous.get(normalized);
      if (current?.price != null && update.price != null && current.price !== update.price) {
        flashes[normalized] = update.price > current.price ? 'up' : 'down';
        changedSymbols.push(normalized);
      }
    }

    set((current) => ({
      feed: updateListBulk(current.feed, normalizedUpdates),
      coins: updateListBulk(current.coins, normalizedUpdates),
      trending: updateListBulk(current.trending, normalizedUpdates),
      flashes,
    }));

    if (changedSymbols.length > 0) {
      setTimeout(() => {
        const current = get();
        const cleared = { ...current.flashes };
        for (const symbol of changedSymbols) delete cleared[symbol];
        set({ flashes: cleared });
      }, 700);
    }
  },

  mergeFeed: (incoming) => {
    if (!Array.isArray(incoming) || incoming.length === 0) return;
    const normalizedIncoming = incoming.map(normalizeAsset);
    const prev = new Map(get().feed.map((asset) => [asset.symbol, asset]));
    const flashes = { ...get().flashes };
    const changedSymbols = [];
    const merged = normalizedIncoming.map((asset) => {
      const previous = prev.get(asset.symbol);
      if (previous?.price != null && asset.price != null && previous.price !== asset.price) {
        flashes[asset.symbol] = asset.price > previous.price ? 'up' : 'down';
        changedSymbols.push(asset.symbol);
      }
      return { ...previous, ...asset };
    });
    const incomingSymbols = new Set(normalizedIncoming.map((asset) => asset.symbol));
    for (const previous of prev.values()) {
      if (!incomingSymbols.has(previous.symbol)) merged.push(previous);
    }
    set({ feed: merged, flashes });
    if (changedSymbols.length > 0) {
      setTimeout(() => {
        const state = get();
        const cleared = { ...state.flashes };
        for (const symbol of changedSymbols) delete cleared[symbol];
        set({ flashes: cleared });
      }, 900);
    }
  },
}));

export const defaultCryptoSymbols = FALLBACK_SYMBOLS;
