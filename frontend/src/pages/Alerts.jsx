import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCircle2, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useAlertStore } from '../stores/alertStore.js';
import { useMarketStore } from '../stores/marketStore.js';
import { useToastStore } from '../stores/toastStore.js';
import ListSkeleton from '../components/skeletons/ListSkeleton.jsx';
import SymbolSelect from '../components/SymbolSelect.jsx';
import PriceInput from '../components/PriceInput.jsx';
import { cn, displaySymbol, fmtMoney } from '../lib/utils.js';

export default function Alerts() {
  const { items, loading, load, create, remove, triggered, clearTriggered } = useAlertStore();
  const feed = useMarketStore((s) => s.feed);
  const loadFeed = useMarketStore((s) => s.loadFeed);
  const toast = useToastStore();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ symbol: '', condition: 'ABOVE', target: '' });

  useEffect(() => { load(); loadFeed(); }, [load, loadFeed]);

  const priceMap = useMemo(() => Object.fromEntries(feed.map((asset) => [asset.symbol, asset])), [feed]);

  const submit = async () => {
    if (!form.symbol || !form.target) {
      toast.error('심볼과 목표가를 입력해 주세요.');
      return;
    }
    const asset = priceMap[form.symbol];
    try {
      await create({
        symbol: form.symbol,
        name: asset?.name || form.symbol,
        type: asset?.type || 'CRYPTO',
        condition: form.condition,
        target: Number(form.target),
      });
      toast.success(`${displaySymbol(form.symbol)} 알림을 만들었습니다.`);
      setForm({ symbol: '', condition: 'ABOVE', target: '' });
      setFormOpen(false);
    } catch (err) {
      toast.error('알림 생성 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const handleDelete = async (id, symbol) => {
    await remove(id);
    toast.info(`${displaySymbol(symbol)} 알림을 삭제했습니다.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-brand-light" /> 가격 알림 {items.length}개
        </h3>
        <button onClick={() => setFormOpen((value) => !value)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors">
          <Plus className="w-3.5 h-3.5" /> 새 알림
        </button>
      </div>

      {triggered.length > 0 && (
        <div className="glass-card p-4 border-brand/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-brand-light flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 최근 실행된 알림
            </p>
            <button onClick={clearTriggered} className="text-[11px] text-text-3 hover:text-text-1">비우기</button>
          </div>
          <div className="space-y-1.5">
            {triggered.map((event) => (
              <p key={event.id} className="text-xs text-text-2 mono">
                <span className="text-brand-light font-bold">{displaySymbol(event.symbol)}</span> · {event.condition} · {event.current}
              </p>
            ))}
          </div>
        </div>
      )}

      {formOpen && (
        <div className="glass-card p-4 grid gap-2 md:grid-cols-4">
          <SymbolSelect value={form.symbol} onChange={(symbol) => setForm({ ...form, symbol, target: priceMap[symbol]?.price ? String(priceMap[symbol].price) : form.target })} />
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="h-10 px-3 rounded-lg bg-bg-soft border border-border text-xs outline-none focus:border-brand">
            <option value="ABOVE">이상</option>
            <option value="BELOW">이하</option>
          </select>
          <PriceInput value={form.target} onChange={(target) => setForm({ ...form, target })} referencePrice={priceMap[form.symbol]?.price} placeholder="목표가" />
          <button onClick={submit} className="h-10 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark">알림 생성</button>
        </div>
      )}

      {loading ? <ListSkeleton /> : (
        <div className="glass-card divide-y divide-border">
          {items.length === 0 && <p className="p-6 text-center text-sm text-text-3">가격 알림이 없습니다.</p>}
          {items.map((item) => {
            const asset = priceMap[item.symbol] || item;
            const isAbove = item.condition === 'ABOVE';
            return (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', isAbove ? 'bg-up/15 text-up' : 'bg-down/15 text-down')}>
                  {isAbove ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{item.name}</p>
                  <p className="text-xs text-text-3 mono">{displaySymbol(item.symbol)} · {isAbove ? '목표가 이상' : '목표가 이하'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold mono">{fmtMoney(item.target, item.type, item.symbol)}</p>
                  <p className="text-xs text-text-3 mono">현재 {fmtMoney(asset.price, item.type, item.symbol)}</p>
                </div>
                <button onClick={() => handleDelete(item.id, item.symbol)} className="p-2 rounded-lg text-text-3 hover:text-down hover:bg-bg-soft" aria-label="삭제">
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
