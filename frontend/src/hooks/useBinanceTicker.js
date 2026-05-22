import { useEffect, useRef } from 'react';
import { fromBinanceSymbol, toBinanceSymbol } from '../lib/binance.js';
import { useMarketStore } from '../stores/marketStore.js';

const BINANCE_WS_URL = import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443';
const BINANCE_REST_URL = import.meta.env.VITE_BINANCE_REST_URL || 'https://api.binance.com';

export function useBinanceTicker(symbols) {
  const updatePrice = useMarketStore((s) => s.updatePrice);
  const wsRef = useRef(null);
  const symbolsKey = symbols?.join(',') || '';

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const binanceSymbols = symbols
      .map((symbol) => toBinanceSymbol(symbol))
      .filter(Boolean)
      .slice(0, 200);

    const streams = binanceSymbols
      .map((symbol) => `${symbol.toLowerCase()}@ticker`)
      .join('/');

    if (!streams) return;

    const ws = new WebSocket(`${BINANCE_WS_URL}/stream?streams=${streams}`);
    wsRef.current = ws;
    let stopped = false;

    const applyTicker = (data) => {
      if (!data?.s || !data?.c) return;
      const symbol = fromBinanceSymbol(data.s);
      const price = Number(data.c);
      const changePercent24h = Number(data.P);
      const change24h = Number(data.p);
      const high24h = Number(data.h);
      const low24h = Number(data.l);
      const volume24h = Number(data.q);
      if (!Number.isFinite(price)) return;
      updatePrice(symbol, {
        price,
        change24h: Number.isFinite(change24h) ? change24h : undefined,
        changePercent24h: Number.isFinite(changePercent24h) ? changePercent24h : undefined,
        high24h: Number.isFinite(high24h) ? high24h : undefined,
        low24h: Number.isFinite(low24h) ? low24h : undefined,
        volume24h: Number.isFinite(volume24h) ? volume24h : undefined,
      });
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        applyTicker(payload?.data);
      } catch (error) {
        console.warn('[binance ticker] parse failed', error);
      }
    };

    ws.onerror = (error) => console.warn('[binance ticker] connection failed', error);

    const pollTickers = async () => {
      try {
        const query = encodeURIComponent(JSON.stringify(binanceSymbols));
        const response = await fetch(`${BINANCE_REST_URL}/api/v3/ticker/24hr?symbols=${query}`, { cache: 'no-store' });
        if (!response.ok) return;
        const rows = await response.json();
        if (stopped || !Array.isArray(rows)) return;
        for (const row of rows) applyTicker(row);
      } catch (error) {
        console.warn('[binance ticker] poll failed', error);
      }
    };
    pollTickers();
    const pollId = window.setInterval(pollTickers, 2000);

    return () => {
      stopped = true;
      window.clearInterval(pollId);
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
      } catch {}
      wsRef.current = null;
    };
  }, [symbolsKey, updatePrice]);
}
