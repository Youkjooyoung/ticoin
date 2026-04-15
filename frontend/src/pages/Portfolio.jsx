import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, LineChart as LineIcon } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { portfolioApi } from '../api/market.js';
import { useToastStore } from '../stores/toastStore.js';
import LineChart from '../components/charts/LineChart.jsx';
import ListSkeleton from '../components/skeletons/ListSkeleton.jsx';
import { cn, fmtPrice, fmtPct, changeClass } from '../lib/utils.js';

const DONUT_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#06B6D4'];

export default function Portfolio() {
  const { feed, loadFeed } = useMarketStore();
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ symbol: '', quantity: '', avgPrice: '' });
  const toast = useToastStore();

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    setLoading(true);
    portfolioApi.list()
      .then((d) => setHoldings(d || []))
      .catch(() => {
        setHoldings([
          { id: 1, symbol: 'BTC', name: 'Bitcoin', type: 'CRYPTO', quantity: 0.5, avgPrice: 58000 },
          { id: 2, symbol: 'ETH', name: 'Ethereum', type: 'CRYPTO', quantity: 3.2, avgPrice: 2900 },
          { id: 3, symbol: 'AAPL', name: 'Apple', type: 'STOCK', quantity: 10, avgPrice: 215 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const priceMap = useMemo(() => Object.fromEntries(feed.map((a) => [a.symbol, a])), [feed]);

  const rows = holdings.map((h) => {
    const cur = priceMap[h.symbol]?.price ?? h.avgPrice;
    const value = cur * Number(h.quantity);
    const cost = Number(h.avgPrice) * Number(h.quantity);
    const pnl = value - cost;
    const pnlPct = cost ? (pnl / cost) * 100 : 0;
    return { ...h, current: cur, value, cost, pnl, pnlPct };
  });

  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost ? (totalPnl / totalCost) * 100 : 0;

  // 7일 수익률 추이 (mock — 실제 서비스는 과거 가격 API가 필요)
  const pnlHistory = useMemo(() => {
    const days = 7;
    const base = totalCost || 10000;
    return Array.from({ length: days }, (_, i) => {
      const progress = (i + 1) / days;
      const wobble = Math.sin(i * 1.3) * 0.015;
      return base * (1 + (totalPnlPct / 100) * progress + wobble);
    });
  }, [totalCost, totalPnlPct]);

  const allocations = rows.map((r, i) => ({
    symbol: r.symbol,
    value: r.value,
    pct: totalValue ? (r.value / totalValue) * 100 : 0,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const addHolding = async () => {
    if (!form.symbol || !form.quantity || !form.avgPrice) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }
    const asset = feed.find((a) => a.symbol === form.symbol.toUpperCase());
    const payload = {
      symbol: form.symbol.toUpperCase(),
      name: asset?.name || form.symbol,
      type: asset?.type || 'CRYPTO',
      quantity: Number(form.quantity),
      avgPrice: Number(form.avgPrice),
    };
    try {
      const created = await portfolioApi.create(payload);
      setHoldings((list) => [...list, created]);
      toast.success(`${payload.symbol}을(를) 추가했습니다`);
    } catch {
      setHoldings((list) => [...list, { id: Date.now(), ...payload }]);
      toast.info('로컬에만 저장되었습니다 (백엔드 미기동)');
    }
    setForm({ symbol: '', quantity: '', avgPrice: '' });
    setFormOpen(false);
  };

  const removeHolding = async (id, symbol) => {
    try {
      await portfolioApi.delete(id);
      toast.success(`${symbol}을(를) 삭제했습니다`);
    } catch {
      toast.info('로컬에서만 제거되었습니다');
    }
    setHoldings((list) => list.filter((h) => h.id !== id));
  };

  const pnlColor = totalPnl >= 0 ? '#10B981' : '#EF4444';

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-xs text-text-3 mb-1">총 자산 가치</p>
        <h3 className="text-3xl font-extrabold mono">${fmtPrice(totalValue)}</h3>
        <p className={cn('mt-1 text-sm font-semibold mono', changeClass(totalPnl))}>
          {totalPnl >= 0 ? '+' : ''}${fmtPrice(Math.abs(totalPnl))} ({fmtPct(totalPnlPct)})
        </p>
      </section>

      {rows.length > 0 && (
        <section className="glass-card p-6">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-1.5">
            <LineIcon className="w-4 h-4 text-brand-light" /> 7일 수익률 추이
          </h4>
          <LineChart data={pnlHistory} color={pnlColor} height={180} />
        </section>
      )}

      {rows.length > 0 && (
        <section className="glass-card p-6">
          <h4 className="text-sm font-bold mb-4">자산 배분</h4>
          <div className="flex items-center gap-6 flex-wrap">
            <Donut slices={allocations} />
            <div className="flex-1 space-y-2 min-w-[200px]">
              {allocations.map((a) => (
                <div key={a.symbol} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
                  <span className="font-semibold flex-1">{a.symbol}</span>
                  <span className="mono text-text-2">{a.pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold">보유 자산</h4>
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> 추가
          </button>
        </div>

        {formOpen && (
          <div className="glass-card p-4 mb-3 grid grid-cols-3 gap-2">
            <input
              placeholder="심볼 (BTC)"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              className="h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand"
            />
            <input
              placeholder="수량"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand"
            />
            <input
              placeholder="평단가"
              type="number"
              value={form.avgPrice}
              onChange={(e) => setForm({ ...form, avgPrice: e.target.value })}
              className="h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand"
            />
            <button onClick={addHolding} className="col-span-3 h-9 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors">저장</button>
          </div>
        )}

        {loading ? (
          <ListSkeleton rows={3} />
        ) : (
          <div className="glass-card divide-y divide-border">
            {rows.length === 0 && (
              <p className="text-center text-sm text-text-3 py-10">보유 자산이 없습니다</p>
            )}
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-xs">
                  {r.symbol?.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-[11px] text-text-3 mono">{r.quantity} @ ${fmtPrice(r.avgPrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold mono">${fmtPrice(r.value)}</p>
                  <p className={cn('text-[11px] font-semibold mono', changeClass(r.pnl))}>
                    {fmtPct(r.pnlPct)}
                  </p>
                </div>
                <button
                  onClick={() => removeHolding(r.id, r.symbol)}
                  className="ml-2 text-text-3 hover:text-down transition-colors"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Donut({ slices, size = 120 }) {
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {slices.map((s) => {
        const len = (s.pct / 100) * circ;
        const el = (
          <circle
            key={s.symbol}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}
