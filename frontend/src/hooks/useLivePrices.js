import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useMarketStore } from '../stores/marketStore.js';
import { useAlertStore } from '../stores/alertStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { getDeviceId } from '../lib/device.js';

const WS_URL = (import.meta.env.VITE_WS_URL ?? '/ws').replace(/\/$/, '');

export function useLivePrices() {
  const mergeFeed = useMarketStore((s) => s.mergeFeed);
  const pushTriggered = useAlertStore((s) => s.pushTriggered);
  const toastSuccess = useToastStore((s) => s.success);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const deviceId = getDeviceId();
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
            console.warn('[ws] prices parse failed', err);
          }
        });

        client.subscribe('/topic/alerts/' + deviceId, (msg) => {
          try {
            const evt = JSON.parse(msg.body);
            pushTriggered(evt);
            toastSuccess(
              `${evt.symbol} 알림 도달! ${evt.condition} $${Number(evt.target).toFixed(2)}`
            );
          } catch (err) {
            console.warn('[ws] alert parse failed', err);
          }
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: () => setConnected(false),
      onWebSocketError: () => setConnected(false),
      debug: () => {},
    });

    try { client.activate(); }
    catch (err) { console.warn('[ws] activation failed', err); }
    clientRef.current = client;

    return () => {
      try { client.deactivate(); } catch {}
      clientRef.current = null;
    };
  }, [mergeFeed, pushTriggered, toastSuccess]);

  return { connected };
}
