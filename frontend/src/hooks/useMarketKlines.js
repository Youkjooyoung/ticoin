import { useEffect, useState } from 'react';
import { marketApi } from '../api/market.js';

export function useMarketKlines(symbol, interval, limit = 100, type = 'CRYPTO') {
  const [candles, setCandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    marketApi.candles(symbol, type, interval)
      .then((data) => {
        if (cancelled) return;
        setCandles(Array.isArray(data) ? data.slice(-limit) : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? '차트 데이터를 불러오지 못했습니다.');
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [symbol, interval, limit, type]);

  return { candles, loading, error };
}
