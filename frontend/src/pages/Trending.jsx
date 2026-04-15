import { useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Flame } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { cn, fmtPrice, fmtPct, changeClass, fmtCompact } from '../lib/utils.js';
import MiniChart from '../components/charts/MiniChart.jsx';

export default function Trending() {
  const { feed, loadFeed } = useMarketStore();
  useEffect(() => { loadFeed(); }, [loadFeed]);

  const sorted = useMemo(
    () => [...feed].sort((a, b) => (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0)),
    [feed]
  );
  const top = sorted.filter((a) => a.changePercent24h > 0).slice(0, 3);
  const worst = [...sorted].reverse().filter((a) => a.changePercent24h < 0).slice(0, 3);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
          <Flame className="w-4 h-4 text-brand-light" /> 최고 상승
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((a, i) => (
            <div key={a.symbol} className="glass-card p-4 relative overflow-hidden">
              <span className="absolute top-3 right-3 text-[10px] font-extrabold text-brand-light bg-brand-soft px-2 py-0.5 rounded-full">#{i + 1}</span>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-up to-up/70 flex items-center justify-center font-extrabold text-xs">
                  {a.symbol?.slice(0, 3)}
                </div>
                <div>
                  <p className="font-bold text-sm">{a.name}</p>
                  <p className="text-[11px] text-text-3 mono">{a.symbol}</p>
                </div>
              </div>
              <MiniChart data={Array.from({ length: 20 }, (_, j) => a.price * (1 + Math.sin(j) * 0.03))} up width={260} height={40} />
              <div className="flex items-center justify-between mt-3">
                <p className="text-base font-bold mono">${fmtPrice(a.price)}</p>
                <p className={cn('text-xs font-bold mono flex items-center gap-1', changeClass(a.changePercent24h))}>
                  <TrendingUp className="w-3 h-3" />
                  {fmtPct(a.changePercent24h)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold mb-3">실시간 랭킹</h3>
        <div className="glass-card divide-y divide-border">
          {sorted.map((a, i) => (
            <div key={a.symbol} className="flex items-center gap-3 p-3.5">
              <span className="w-6 text-center text-xs text-text-3 mono font-bold">{i + 1}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-[10px]">
                {a.symbol?.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{a.name}</p>
                <p className="text-[11px] text-text-3 mono">${fmtCompact(a.marketCap)}</p>
              </div>
              <MiniChart data={Array.from({ length: 20 }, (_, j) => a.price * (1 + Math.sin(j * 0.5) * 0.02))} up={a.changePercent24h >= 0} width={60} height={24} />
              <div className="text-right w-24">
                <p className="text-sm font-bold mono">${fmtPrice(a.price)}</p>
                <p className={cn('text-[11px] font-semibold mono', changeClass(a.changePercent24h))}>
                  {fmtPct(a.changePercent24h)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {worst.length > 0 && (
        <section>
          <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
            <TrendingDown className="w-4 h-4 text-down" /> 하락 종목
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {worst.map((a) => (
              <div key={a.symbol} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-down/20 border border-down/40 flex items-center justify-center font-extrabold text-[10px] text-down">
                    {a.symbol?.slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{a.name}</p>
                    <p className={cn('text-[11px] font-semibold mono', changeClass(a.changePercent24h))}>
                      {fmtPct(a.changePercent24h)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
