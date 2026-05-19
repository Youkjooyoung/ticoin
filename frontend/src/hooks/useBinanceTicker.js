import { useEffect, useRef } from 'react';
import { fromBinanceSymbol, toBinanceSymbol } from '../lib/binance.js';
import { useMarketStore } from '../stores/marketStore.js';

const BINANCE_WS_URL = import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443';

export function useBinanceTicker(symbols) {
  const updatePrice = useMarketStore((s) => s.updatePrice);
  const wsRef = useRef(null);
  const symbolsKey = symbols?.join(',') || '';

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const streams = symbols
      .map((symbol) => toBinanceSymbol(symbol))
      .filter(Boolean)
      .map((symbol) => `${symbol.toLowerCase()}@ticker`)
      .join('/');

    if (!streams) return;

    const ws = new WebSocket(`${BINANCE_WS_URL}/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const data = payload?.data;
        if (!data?.s || !data?.c) return;
        const symbol = fromBinanceSymbol(data.s);
        const price = Number(data.c);
        const change24h = Number(data.P);
        const high24h = Number(data.h);
        const low24h = Number(data.l);
        const volume24h = Number(data.q);
        if (!Number.isFinite(price)) return;
        updatePrice(symbol, {
          price,
          changePercent24h: Number.isFinite(change24h) ? change24h : undefined,
          high24h: Number.isFinite(high24h) ? high24h : undefined,
          low24h: Number.isFinite(low24h) ? low24h : undefined,
          volume24h: Number.isFinite(volume24h) ? volume24h : undefined,
        });
      } catch (error) {
        console.warn('[binance ticker] parse failed', error);
      }
    };

    ws.onerror = (error) => console.warn('[binance ticker] connection failed', error);

    return () => {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [symbolsKey, updatePrice]);
}
