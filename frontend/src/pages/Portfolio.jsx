import { useEffect, useMemo, useState } from 'react';
import { LineChart as LineIcon, Plus, Trash2 } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { portfolioApi } from '../api/market.js';
import { useToastStore } from '../stores/toastStore.js';
import LineChart from '../components/charts/LineChart.jsx';
import ListSkeleton from '../components/skeletons/ListSkeleton.jsx';
import SymbolSelect from '../components/SymbolSelect.jsx';
import PriceInput from '../components/PriceInput.jsx';
import { changeClass, cn, displaySymbol, fmtMoney, fmtPct } from '../lib/utils.js';

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
      .then((data) => setHoldings(data || []))
      .catch(() => setHoldings([]))
      .finally(() => setLoading(false));
  }, []);

  const priceMap = useMemo(() => Object.fromEntries(feed.map((asset) => [asset.symbol, asset])), [feed]);
  const rows = holdings.map((holding) => {
    const asset = priceMap[holding.symbol];
    const current = asset?.price ?? holding.avgPrice;
    const value = Number(current) * Number(holding.quantity);
    const cost = Number(holding.avgPrice) * Number(holding.quantity);
    const pnl = value - cost;
    const pnlPct = cost ? (pnl / cost) * 100 : 0;
    return { ...holding, asset, current, value, cost, pnl, pnlPct };
  });

  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost ? (totalPnl / totalCost) * 100 : 0;
  const pnlHistory = useMemo(() => Array.from({ length: 7 }, (_, i) => totalCost * (1 + (totalPnlPct / 100) * ((i + 1) / 7) + Math.sin(i) * 0.01)), [totalCost, totalPnlPct]);

  const addHolding = async () => {
    if (!form.symbol || !form.quantity || !form.avgPrice) {
      toast.error('모든 필드를 입력해 주세요.');
      return;
    }
    const asset = priceMap[form.symbol];
    const payload = {
      symbol: form.symbol,
      name: asset?.name || form.symbol,
      type: asset?.type || 'CRYPTO',
      quantity: Number(form.quantity),
      avgPrice: Number(form.avgPrice),
    };
    try {
      const created = await portfolioApi.create(payload);
      setHoldings((list) => [created, ...list]);
      toast.success(`${displaySymbol(payload.symbol)}을 추가했습니다.`);
      setForm({ symbol: '', quantity: '', avgPrice: '' });
      setFormOpen(false);
    } catch (err) {
      toast.error('추가 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const removeHolding = async (id, symbol) => {
    try {
      await portfolioApi.delete(id);
      setHoldings((list) => list.filter((holding) => holding.id !== id));
      toast.success(`${displaySymbol(symbol)}을 삭제했습니다.`);
    } catch (err) {
      toast.error('삭제 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const selectedAsset = priceMap[form.symbol];

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <p className="text-xs text-text-3 mb-1">총 자산 가치</p>
        <h3 className="text-3xl font-extrabold mono">{fmtMoney(totalValue, selectedAsset?.type || 'CRYPTO', selectedAsset?.symbol || 'BTC')}</h3>
        <p className={cn('mt-1 text-sm font-semibold mono', changeClass(totalPnl))}>
          {totalPnl >= 0 ? '+' : ''}{fmtMoney(Math.abs(totalPnl), selectedAsset?.type || 'CRYPTO', selectedAsset?.symbol || 'BTC')} ({fmtPct(totalPnlPct)})
        </p>
      </section>

      {rows.length > 0 && (
        <section className="glass-card p-6">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-1.5">
            <LineIcon className="w-4 h-4 text-brand-light" /> 7일 수익률 추이
          </h4>
          <LineChart data={pnlHistory} color={totalPnl >= 0 ? '#DC2626' : '#2563EB'} height={180} />
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">보유 자산 {rows.length}개</h3>
          <button onClick={() => setFormOpen((value) => !value)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors">
            <Plus className="w-3.5 h-3.5" /> 자산 추가
          </button>
        </div>

        {formOpen && (
          <div className="glass-card p-4 grid gap-2 md:grid-cols-4 mb-3">
            <SymbolSelect value={form.symbol} onChange={(symbol) => setForm({ ...form, symbol, avgPrice: priceMap[symbol]?.price ? String(priceMap[symbol].price) : form.avgPrice })} />
            <input className="h-10 px-3 rounded-lg bg-bg-soft border border-border text-xs outline-none focus:border-brand" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="수량" type="number" min="0" />
            <PriceInput value={form.avgPrice} onChange={(avgPrice) => setForm({ ...form, avgPrice })} referencePrice={selectedAsset?.price} placeholder="평균 단가" />
            <button onClick={addHolding} className="h-10 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark">추가</button>
          </div>
        )}

        {loading ? <ListSkeleton /> : (
          <div className="glass-card divide-y divide-border">
            {rows.length === 0 && <p className="p-6 text-center text-sm text-text-3">아직 보유 자산이 없습니다.</p>}
            {rows.map((row) => (
              <div key={row.id} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg gradient-brand-bg text-white flex items-center justify-center font-bold text-xs">{displaySymbol(row.symbol).slice(0, 3)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{row.name}</p>
                  <p className="text-xs text-text-3 mono">{displaySymbol(row.symbol)} · {row.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold mono">{fmtMoney(row.value, row.type, row.symbol)}</p>
                  <p className={cn('text-xs font-semibold mono', changeClass(row.pnl))}>{fmtPct(row.pnlPct)}</p>
                </div>
                <button onClick={() => removeHolding(row.id, row.symbol)} className="p-2 rounded-lg text-text-3 hover:text-down hover:bg-bg-soft" aria-label="삭제">
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
