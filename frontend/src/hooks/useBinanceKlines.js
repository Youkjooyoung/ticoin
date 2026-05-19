import { useEffect, useState } from 'react';
import { BINANCE_INTERVAL, toBinanceSymbol } from '../lib/binance.js';

const BINANCE_REST_URL = import.meta.env.VITE_BINANCE_REST_URL || 'https://api.binance.com';
const BINANCE_WS_URL = import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443';

function mapKline(kline) {
  return {
    time: Math.floor(Number(kline[0]) / 1000),
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    volume: Number(kline[5]),
  };
}

function mapSocketKline(kline) {
  return {
    time: Math.floor(Number(kline.t) / 1000),
    open: Number(kline.o),
    high: Number(kline.h),
    low: Number(kline.l),
    close: Number(kline.c),
    volume: Number(kline.v),
  };
}

export function useBinanceKlines(symbol, interval, limit = 100) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const binanceSymbol = toBinanceSymbol(symbol);
    const binanceInterval = BINANCE_INTERVAL[interval] || '1h';
    if (!binanceSymbol) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${BINANCE_REST_URL}/api/v3/klines?symbol=${binanceSymbol}&interval=${binanceInterval}&limit=${limit}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
      .then((data) => {
        if (cancelled) return;
        setCandles(Array.isArray(data) ? data.map(mapKline) : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[binance klines]', binanceSymbol, binanceInterval, err.message);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [symbol, interval, limit]);

  useEffect(() => {
    const binanceSymbol = toBinanceSymbol(symbol);
    const binanceInterval = BINANCE_INTERVAL[interval] || '1h';
    if (!binanceSymbol) return;

    const ws = new WebSocket(`${BINANCE_WS_URL}/ws/${binanceSymbol.toLowerCase()}@kline_${binanceInterval}`);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const kline = payload?.k;
        if (!kline) return;
        const next = mapSocketKline(kline);
        setCandles((current) => {
          if (current.length === 0) return [next];
          const last = current[current.length - 1];
          if (last.time === next.time) return [...current.slice(0, -1), next];
          return [...current.slice(-limit + 1), next];
        });
      } catch (error) {
        console.warn('[binance kline] parse failed', error);
      }
    };
    ws.onerror = (error) => console.warn('[binance kline] connection failed', error);

    return () => {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
      } catch {}
    };
  }, [symbol, interval, limit]);

  return { candles, loading, error };
}
