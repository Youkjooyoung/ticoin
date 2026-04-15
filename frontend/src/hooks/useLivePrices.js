import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useMarketStore } from '../stores/marketStore.js';

const WS_URL = (import.meta.env.VITE_WS_URL ?? '/ws').replace(/\/$/, '');

export function useLivePrices() {
  const mergeFeed = useMarketStore((s) => s.mergeFeed);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/prices', (msg) => {
          try {
            const payload = JSON.parse(msg.body);
            mergeFeed(payload);
          } catch (err) {
            console.warn('[ws] payload parse failed', err);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
      debug: () => {},
    });

    try {
      client.activate();
    } catch (err) {
      console.warn('[ws] activation failed', err);
    }
    clientRef.current = client;

    return () => {
      try { client.deactivate(); } catch {}
      clientRef.current = null;
    };
  }, [mergeFeed]);

  return { connected };
}
