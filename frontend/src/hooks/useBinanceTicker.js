import { useEffect, useRef } from 'react';
import { toBinanceSymbol, fromBinanceSymbol } from '../lib/binance.js';
import { useMarketStore } from '../stores/marketStore.js';

export function useBinanceTicker(symbols) {
  const updatePrice = useMarketStore((s) => s.updatePrice);
  const wsRef = useRef(null);
  const symbolsKey = symbols?.join(',') || '';

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    const streams = symbols
      .map((s) => toBinanceSymbol(s))
      .filter(Boolean)
      .map((bSym) => bSym.toLowerCase() + '@ticker')
      .join('/');

    if (!streams) return;

    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    const ws = new WebSocket(url);

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        const d = msg?.data;
        if (!d || !d.s || !d.c) return;
        const sym = fromBinanceSymbol(d.s);
        const price = parseFloat(d.c);
        if (!isNaN(price)) updatePrice(sym, price);
      } catch (err) {
        console.warn('[binance ticker] parse failed', err);
      }
    };

    ws.onerror = (err) => console.warn('[binance ticker] error', err);
    ws.onclose = () => {};
    wsRef.current = ws;

    return () => {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close();
        }
      } catch {}
      wsRef.current = null;
    };
  }, [symbolsKey, updatePrice]);
}
