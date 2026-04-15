import { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { useBinanceTicker } from '../hooks/useBinanceTicker.js';
import { watchlistApi } from '../api/market.js';
import { useToastStore } from '../stores/toastStore.js';
import ListSkeleton from '../components/skeletons/ListSkeleton.jsx';
import MiniChart from '../components/charts/MiniChart.jsx';
import SymbolSelect from '../components/SymbolSelect.jsx';
import PriceInput from '../components/PriceInput.jsx';
import { cn, fmtPrice, fmtPct, changeClass } from '../lib/utils.js';

const ORDER_KEY = 'ticoin-watchlist-order';

function loadOrder() {
  try { return JSON.parse(localStorage.getItem(ORDER_KEY) || '[]'); }
  catch { return []; }
}
function saveOrder(symbols) {
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(symbols)); } catch {}
}

export default function Watchlist() {
  const { feed, loadFeed } = useMarketStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ symbol: '', targetPrice: '' });
  const toast = useToastStore();

  const cryptoSymbols = useMemo(
    () => feed.filter((a) => a.type === 'CRYPTO').map((a) => a.symbol),
    [feed]
  );
  useBinanceTicker(cryptoSymbols);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    setLoading(true);
    watchlistApi.list()
      .then((d) => setItems(d || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const priceMap = useMemo(() => Object.fromEntries(feed.map((a) => [a.symbol, a])), [feed]);

  // localStorage 순서대로 정렬
  const sortedItems = useMemo(() => {
    const order = loadOrder();
    if (!order.length) return items;
    const orderMap = new Map(order.map((s, i) => [s, i]));
    return [...items].sort((a, b) => {
      const ai = orderMap.has(a.symbol) ? orderMap.get(a.symbol) : 999;
      const bi = orderMap.has(b.symbol) ? orderMap.get(b.symbol) : 999;
      return ai - bi;
    });
  }, [items]);

  const move = (idx, delta) => {
    const list = [...sortedItems];
    const ni = idx + delta;
    if (ni < 0 || ni >= list.length) return;
    [list[idx], list[ni]] = [list[ni], list[idx]];
    saveOrder(list.map((x) => x.symbol));
    setItems(list);
  };

  const toggleAlert = async (item) => {
    try {
      const updated = await watchlistApi.toggleAlert(item.id);
      setItems((l) => l.map((x) => (x.id === item.id ? updated : x)));
      toast.success(`${item.symbol} 알림을 ${updated.alertEnabled ? '켰습니다' : '껐습니다'}`);
    } catch (err) {
      toast.error('변경 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const remove = async (id, symbol) => {
    try {
      await watchlistApi.delete(id);
      setItems((l) => l.filter((x) => x.id !== id));
      toast.success(`${symbol}을(를) 관심목록에서 삭제했습니다`);
    } catch (err) {
      toast.error('삭제 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const add = async () => {
    if (!form.symbol) {
      toast.error('심볼을 입력해주세요');
      return;
    }
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
      setItems((l) => [created, ...l]);
      toast.success(`${payload.symbol}을(를) 추가했습니다`);
    } catch (err) {
      toast.error('추가 실패: ' + (err?.response?.data?.message ?? err.message));
      return;
    }
    setForm({ symbol: '', targetPrice: '' });
    setFormOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">저장된 자산 {sortedItems.length}개</h3>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      {formOpen && (() => {
        const selected = priceMap[form.symbol];
        const refPrice = selected?.price ?? 100;
        return (
          <div className="glass-card p-4 grid grid-cols-2 gap-2">
            <SymbolSelect
              value={form.symbol}
              onChange={(v) => setForm({ ...form, symbol: v })}
              placeholder="심볼 선택"
            />
            <PriceInput
              value={form.targetPrice}
              onChange={(v) => setForm({ ...form, targetPrice: v })}
              referencePrice={refPrice}
              placeholder="목표가 (선택)"
            />
            <button onClick={add} className="col-span-2 h-9 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors">저장</button>
          </div>
        );
      })()}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="glass-card divide-y divide-border">
          {sortedItems.length === 0 && (
            <p className="text-center text-sm text-text-3 py-10">관심목록이 비어있습니다</p>
          )}
          {sortedItems.map((item, idx) => {
            const asset = priceMap[item.symbol];
            const cur = asset?.price ?? 0;
            const gap = item.targetPrice ? ((item.targetPrice - cur) / cur) * 100 : null;
            return (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="w-6 h-5 rounded bg-bg-soft hover:bg-brand-soft disabled:opacity-30 flex items-center justify-center transition-colors"
                    aria-label="위로"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === sortedItems.length - 1}
                    className="w-6 h-5 rounded bg-bg-soft hover:bg-brand-soft disabled:opacity-30 flex items-center justify-center transition-colors"
                    aria-label="아래로"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                <button onClick={() => remove(item.id, item.symbol)} className="text-text-3 hover:text-down transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
