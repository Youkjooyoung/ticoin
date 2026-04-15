import { useEffect, useState } from 'react';
import { toBinanceSymbol, BINANCE_INTERVAL } from '../lib/binance.js';

/**
 * Binance 공개 REST API에서 직접 klines를 가져와 CandleChart 데이터 형식으로 변환.
 * CORS 허용되며 인증 불필요.
 */
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

    fetch(`https://api.binance.com/api/v3/klines?symbol=${bSym}&interval=${bInt}&limit=${limit}`)
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
