import { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { watchlistApi } from '../api/market.js';
import { useToastStore } from '../stores/toastStore.js';
import ListSkeleton from '../components/skeletons/ListSkeleton.jsx';
import SymbolSelect from '../components/SymbolSelect.jsx';
import PriceInput from '../components/PriceInput.jsx';
import { changeClass, cn, displaySymbol, fmtMoney, fmtPct } from '../lib/utils.js';

const ORDER_KEY = 'ticoin-watchlist-order';

function loadOrder() {
  try { return JSON.parse(localStorage.getItem(ORDER_KEY) || '[]'); } catch { return []; }
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

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    setLoading(true);
    watchlistApi.list()
      .then((data) => setItems(data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const priceMap = useMemo(() => Object.fromEntries(feed.map((asset) => [asset.symbol, asset])), [feed]);
  const sortedItems = useMemo(() => {
    const order = loadOrder();
    if (!order.length) return items;
    const orderMap = new Map(order.map((symbol, i) => [symbol, i]));
    return [...items].sort((a, b) => (orderMap.get(a.symbol) ?? 999) - (orderMap.get(b.symbol) ?? 999));
  }, [items]);

  const move = (idx, delta) => {
    const list = [...sortedItems];
    const nextIndex = idx + delta;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    [list[idx], list[nextIndex]] = [list[nextIndex], list[idx]];
    saveOrder(list.map((item) => item.symbol));
    setItems(list);
  };

  const add = async () => {
    if (!form.symbol) {
      toast.error('심볼을 선택해 주세요.');
      return;
    }
    const asset = priceMap[form.symbol];
    const payload = {
      symbol: form.symbol,
      name: asset?.name || form.symbol,
      type: asset?.type || 'CRYPTO',
      targetPrice: Number(form.targetPrice) || null,
      alertEnabled: true,
    };
    try {
      const created = await watchlistApi.create(payload);
      setItems((list) => [created, ...list]);
      toast.success(`${displaySymbol(payload.symbol)}을 추가했습니다.`);
      setForm({ symbol: '', targetPrice: '' });
      setFormOpen(false);
    } catch (err) {
      toast.error('추가 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const toggleAlert = async (item) => {
    try {
      const updated = await watchlistApi.toggleAlert(item.id);
      setItems((list) => list.map((current) => current.id === item.id ? updated : current));
      toast.success(`${displaySymbol(item.symbol)} 알림을 ${updated.alertEnabled ? '켰습니다.' : '껐습니다.'}`);
    } catch (err) {
      toast.error('알림 변경 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const remove = async (id, symbol) => {
    try {
      await watchlistApi.delete(id);
      setItems((list) => list.filter((item) => item.id !== id));
      toast.success(`${displaySymbol(symbol)}을 삭제했습니다.`);
    } catch (err) {
      toast.error('삭제 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">관심 자산 {sortedItems.length}개</h3>
        <button onClick={() => setFormOpen((value) => !value)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-3.5 h-3.5" /> 추가
        </button>
      </div>

      {formOpen && (
        <div className="glass-card p-4 grid gap-2 md:grid-cols-3">
          <SymbolSelect value={form.symbol} onChange={(symbol) => setForm({ ...form, symbol, targetPrice: priceMap[symbol]?.price ? String(priceMap[symbol].price) : form.targetPrice })} />
          <PriceInput value={form.targetPrice} onChange={(targetPrice) => setForm({ ...form, targetPrice })} referencePrice={priceMap[form.symbol]?.price} placeholder="목표가" />
          <button onClick={add} className="h-10 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark">관심목록 추가</button>
        </div>
      )}

      {loading ? <ListSkeleton /> : (
        <div className="glass-card divide-y divide-border">
          {sortedItems.length === 0 && <p className="p-6 text-center text-sm text-text-3">관심목록이 비어 있습니다.</p>}
          {sortedItems.map((item, index) => {
            const asset = priceMap[item.symbol] || item;
            return (
              <div key={item.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg gradient-brand-bg text-white flex items-center justify-center font-bold text-xs">{displaySymbol(item.symbol).slice(0, 3)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-text-3 mono">{displaySymbol(item.symbol)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold mono">{fmtMoney(asset.price, item.type, item.symbol)}</p>
                  <p className={cn('text-xs font-semibold mono', changeClass(asset.changePercent24h))}>{fmtPct(asset.changePercent24h)}</p>
                </div>
                <button onClick={() => toggleAlert(item)} className={cn('p-2 rounded-lg hover:bg-bg-soft', item.alertEnabled ? 'text-brand-light' : 'text-text-3')} aria-label="알림 토글">
                  {item.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button onClick={() => move(index, -1)} className="p-1 text-text-3 hover:text-text-1" aria-label="위로"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => move(index, 1)} className="p-1 text-text-3 hover:text-text-1" aria-label="아래로"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => remove(item.id, item.symbol)} className="p-2 rounded-lg text-text-3 hover:text-down hover:bg-bg-soft" aria-label="삭제"><Trash2 className="w-4 h-4" /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
