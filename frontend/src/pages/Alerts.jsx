import { useEffect, useMemo, useState } from 'react';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { useAlertStore } from '../stores/alertStore.js';
import { useMarketStore } from '../stores/marketStore.js';
import { useBinanceTicker } from '../hooks/useBinanceTicker.js';
import { useToastStore } from '../stores/toastStore.js';
import ListSkeleton from '../components/skeletons/ListSkeleton.jsx';
import SymbolSelect from '../components/SymbolSelect.jsx';
import PriceInput from '../components/PriceInput.jsx';
import { cn, fmtPrice } from '../lib/utils.js';

export default function Alerts() {
  const { items, loading, load, create, remove, triggered, clearTriggered } = useAlertStore();
  const feed = useMarketStore((s) => s.feed);
  const loadFeed = useMarketStore((s) => s.loadFeed);
  const toast = useToastStore();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ symbol: '', condition: 'ABOVE', target: '' });

  useEffect(() => { load(); loadFeed(); }, [load, loadFeed]);

  const priceMap = Object.fromEntries(feed.map((a) => [a.symbol, a]));

  const cryptoSymbols = useMemo(
    () => feed.filter((a) => a.type === 'CRYPTO').map((a) => a.symbol),
    [feed]
  );
  useBinanceTicker(cryptoSymbols);

  const submit = async () => {
    if (!form.symbol || !form.target) {
      toast.error('심볼과 목표가를 입력해주세요');
      return;
    }
    const asset = feed.find((a) => a.symbol === form.symbol.toUpperCase());
    try {
      await create({
        symbol: form.symbol.toUpperCase(),
        name: asset?.name || form.symbol,
        type: asset?.type || 'CRYPTO',
        condition: form.condition,
        target: Number(form.target),
      });
      toast.success(`${form.symbol.toUpperCase()} 알림 등록`);
      setForm({ symbol: '', condition: 'ABOVE', target: '' });
      setFormOpen(false);
    } catch (err) {
      toast.error('알림 등록 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const handleDelete = async (id, symbol) => {
    await remove(id);
    toast.info(`${symbol} 알림 삭제`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-brand-light" /> 가격 알림 {items.length}개
        </h3>
        <button
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> 새 알림
        </button>
      </div>

      {triggered.length > 0 && (
        <div className="glass-card p-4 border-brand/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-brand-light flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 최근 발동된 알림
            </p>
            <button onClick={clearTriggered} className="text-[11px] text-text-3 hover:text-text-1">
              지우기
            </button>
          </div>
          <div className="space-y-1.5">
            {triggered.map((evt) => (
              <p key={evt.id} className="text-xs text-text-2 mono">
                <span className="text-brand-light font-bold">{evt.symbol}</span> · {evt.condition} ${fmtPrice(evt.target)} · 현재 ${fmtPrice(evt.current)}
              </p>
            ))}
          </div>
        </div>
      )}

      {formOpen && (
        <div className="glass-card p-4 grid grid-cols-3 gap-2">
          <SymbolSelect
            value={form.symbol}
            onChange={(v) => {
              const asset = priceMap[v];
              setForm({ ...form, symbol: v, target: asset?.price ? String(asset.price) : form.target });
            }}
            placeholder="심볼 선택"
          />
          <select
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
            className="h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand cursor-pointer"
          >
            <option value="ABOVE">이상 (상승 돌파)</option>
            <option value="BELOW">이하 (하락 돌파)</option>
          </select>
          <PriceInput
            value={form.target}
            onChange={(v) => setForm({ ...form, target: v })}
            referencePrice={priceMap[form.symbol]?.price ?? 100}
            placeholder="목표가"
          />
          <button
            onClick={submit}
            className="col-span-3 h-9 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
          >
            저장
          </button>
        </div>
      )}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="glass-card divide-y divide-border">
          {items.length === 0 && (
            <p className="text-center text-sm text-text-3 py-10">등록된 알림이 없습니다</p>
          )}
          {items.map((a) => {
            const cur = priceMap[a.symbol]?.price ?? 0;
            const isAbove = a.condition === 'ABOVE';
            return (
              <div key={a.id} className="flex items-center gap-3 p-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    isAbove ? 'bg-up/10 text-up border border-up/30' : 'bg-down/10 text-down border border-down/30'
                  )}
                >
                  {isAbove ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2">
                    {a.name}
                    {a.triggered && (
                      <span className="text-[10px] font-bold text-brand-light bg-brand-soft px-2 py-0.5 rounded-full">
                        발동됨
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-3 mono">
                    {a.symbol} · {isAbove ? '≥' : '≤'} ${fmtPrice(a.target)}
                  </p>
                </div>
                <div className="text-right w-24">
                  <p className="text-sm font-bold mono">${fmtPrice(cur)}</p>
                  <p className="text-[11px] text-text-3">현재가</p>
                </div>
                <button
                  onClick={() => handleDelete(a.id, a.symbol)}
                  className="text-text-3 hover:text-down transition-colors"
                >
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
