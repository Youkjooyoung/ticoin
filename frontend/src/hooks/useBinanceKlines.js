import { useEffect, useState } from 'react';
import { toBinanceSymbol, BINANCE_INTERVAL } from '../lib/binance.js';

const BINANCE_REST_URL = import.meta.env.VITE_BINANCE_REST_URL || 'https://api.binance.com';

export function useBinanceKlines(symbol, interval, limit = 100) {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    const bSym = toBinanceSymbol(symbol);
    const bInt = BINANCE_INTERVAL[interval] || '1h';
    if (!bSym) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${BINANCE_REST_URL}/api/v3/klines?symbol=${bSym}&interval=${bInt}&limit=${limit}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        const mapped = data.map((k) => ({
          time: Math.floor(k[0] / 1000),
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
        }));
        setCandles(mapped);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[binance klines]', bSym, bInt, err.message);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [symbol, interval, limit]);

  return { candles, loading, error };
}
