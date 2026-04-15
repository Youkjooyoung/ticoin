import { useEffect, useState } from 'react';
import { Bell, BellOff, Trash2, Plus } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { watchlistApi } from '../api/market.js';
import { cn, fmtPrice, fmtPct, changeClass } from '../lib/utils.js';
import MiniChart from '../components/charts/MiniChart.jsx';

export default function Watchlist() {
  const { feed, loadFeed } = useMarketStore();
  const [items, setItems] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ symbol: '', targetPrice: '' });

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    watchlistApi.list().then((d) => setItems(d || [])).catch(() => {
      setItems([
        { id: 1, symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', targetPrice: 75000, alertEnabled: true },
        { id: 2, symbol: 'TSLA', name: 'Tesla', type: 'STOCK', targetPrice: 450, alertEnabled: false },
      ]);
    });
  }, []);

  const priceMap = Object.fromEntries(feed.map((a) => [a.symbol, a]));

  const toggleAlert = async (item) => {
    try {
      const updated = await watchlistApi.toggleAlert(item.id);
      setItems((l) => l.map((x) => (x.id === item.id ? updated : x)));
    } catch {
      setItems((l) => l.map((x) => (x.id === item.id ? { ...x, alertEnabled: !x.alertEnabled } : x)));
    }
  };

  const remove = async (id) => {
    try { await watchlistApi.delete(id); } catch {}
    setItems((l) => l.filter((x) => x.id !== id));
  };

  const add = async () => {
    if (!form.symbol) return;
    const asset = feed.find((a) => a.symbol === form.symbol.toUpperCase());
    const payload = {
      symbol: form.symbol.toUpperCase(),
      name: asset?.name || form.symbol,
      type: asset?.type || 'CRYPTO',
      targetPrice: Number(form.targetPrice) || null,
      alertEnabled: true,
    };
    try {
      const created = await watchlistApi.create(payload);
      setItems((l) => [...l, created]);
    } catch {
      setItems((l) => [...l, { id: Date.now(), ...payload }]);
    }
    setForm({ symbol: '', targetPrice: '' });
    setFormOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">저장된 자산 {items.length}개</h3>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      {formOpen && (
        <div className="glass-card p-4 grid grid-cols-2 gap-2">
          <input
            placeholder="심볼"
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
            className="h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand"
          />
          <input
            placeholder="목표가 (선택)"
            type="number"
            value={form.targetPrice}
            onChange={(e) => setForm({ ...form, targetPrice: e.target.value })}
            className="h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand"
          />
          <button onClick={add} className="col-span-2 h-9 rounded-md bg-brand text-white text-xs font-semibold">저장</button>
        </div>
      )}

      <div className="glass-card divide-y divide-border">
        {items.length === 0 && (
          <p className="text-center text-sm text-text-3 py-10">관심목록이 비어있습니다</p>
        )}
        {items.map((item) => {
          const asset = priceMap[item.symbol];
          const cur = asset?.price ?? 0;
          const gap = item.targetPrice ? ((item.targetPrice - cur) / cur) * 100 : null;
          return (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-xs">
                {item.symbol?.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[11px] text-text-3 mono">
                  {item.symbol}
                  {item.targetPrice ? ` · 목표 $${fmtPrice(item.targetPrice)}` : ''}
                  {gap != null ? ` (${gap >= 0 ? '+' : ''}${gap.toFixed(1)}%)` : ''}
                </p>
              </div>
              <MiniChart data={Array.from({ length: 20 }, (_, j) => cur * (1 + Math.sin(j * 0.4) * 0.02))} up={(asset?.changePercent24h ?? 0) >= 0} width={60} height={24} />
              <div className="text-right w-20">
                <p className="text-sm font-bold mono">${fmtPrice(cur)}</p>
                <p className={cn('text-[11px] font-semibold mono', changeClass(asset?.changePercent24h))}>
                  {fmtPct(asset?.changePercent24h)}
                </p>
              </div>
              <button onClick={() => toggleAlert(item)} className={cn('p-1.5 rounded-md transition-colors', item.alertEnabled ? 'text-brand-light bg-brand-soft' : 'text-text-3 hover:text-text-1')}>
                {item.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <button onClick={() => remove(item.id)} className="text-text-3 hover:text-down transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
