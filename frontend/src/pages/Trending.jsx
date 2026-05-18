import { useEffect, useMemo, useState } from 'react';
import { Flame, TrendingDown, TrendingUp } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { changeClass, cn, displaySymbol, fmtMoney, fmtPct, fmtVolume } from '../lib/utils.js';
import MiniChart from '../components/charts/MiniChart.jsx';
import AssetDetailModal from '../components/AssetDetailModal.jsx';

export default function Trending() {
  const { feed, loadFeed } = useMarketStore();
  const [selected, setSelected] = useState(null);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const sorted = useMemo(() => [...feed].sort((a, b) => (b.changePercent24h ?? 0) - (a.changePercent24h ?? 0)), [feed]);
  const top = sorted.filter((asset) => asset.changePercent24h > 0).slice(0, 3);
  const worst = [...sorted].reverse().filter((asset) => asset.changePercent24h < 0).slice(0, 3);

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
          <Flame className="w-4 h-4 text-brand-light" /> 상승률 상위
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((asset, index) => (
            <AssetRankCard key={asset.symbol} asset={asset} rank={index + 1} onClick={() => setSelected(asset)} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold mb-3">실시간 순위</h3>
        <div className="glass-card divide-y divide-border">
          {sorted.map((asset, index) => (
            <button key={asset.symbol} type="button" onClick={() => setSelected(asset)} className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-bg-soft transition-colors">
              <span className="w-6 text-center text-xs text-text-3 mono font-bold">{index + 1}</span>
              <div className="w-9 h-9 rounded-lg gradient-brand-bg flex items-center justify-center font-extrabold text-[10px] text-white">
                {displaySymbol(asset.symbol).slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{asset.name}</p>
                <p className="text-[11px] text-text-3 mono">{fmtVolume(asset.volume24h, asset.type, asset.symbol)}</p>
              </div>
              <MiniChart data={Array.from({ length: 20 }, (_, j) => asset.price * (1 + Math.sin(j * 0.5) * 0.02))} up={asset.changePercent24h >= 0} width={60} height={24} />
              <div className="text-right w-28">
                <p className="text-sm font-bold mono">{fmtMoney(asset.price, asset.type, asset.symbol)}</p>
                <p className={cn('text-[11px] font-semibold mono', changeClass(asset.changePercent24h))}>{fmtPct(asset.changePercent24h)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {worst.length > 0 && (
        <section>
          <h3 className="text-sm font-bold flex items-center gap-1.5 mb-3">
            <TrendingDown className="w-4 h-4 text-down" /> 하락률 상위
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {worst.map((asset) => (
              <button key={asset.symbol} type="button" onClick={() => setSelected(asset)} className="glass-card p-4 text-left hover:border-down/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-down/20 border border-down/40 flex items-center justify-center font-extrabold text-[10px] text-down">
                    {displaySymbol(asset.symbol).slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{asset.name}</p>
                    <p className={cn('text-[11px] font-semibold mono', changeClass(asset.changePercent24h))}>{fmtPct(asset.changePercent24h)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {selected && <AssetDetailModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AssetRankCard({ asset, rank, onClick }) {
  return (
    <button type="button" onClick={onClick} className="glass-card p-4 relative overflow-hidden text-left hover:border-brand/50 transition-colors">
      <span className="absolute top-3 right-3 text-[10px] font-extrabold text-brand-light bg-brand-soft px-2 py-0.5 rounded-full">#{rank}</span>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-up/20 border border-up/40 flex items-center justify-center font-extrabold text-xs text-up">
          {displaySymbol(asset.symbol).slice(0, 3)}
        </div>
        <div>
          <p className="font-bold text-sm">{asset.name}</p>
          <p className="text-[11px] text-text-3 mono">{displaySymbol(asset.symbol)}</p>
        </div>
      </div>
      <MiniChart data={Array.from({ length: 20 }, (_, j) => asset.price * (1 + Math.sin(j) * 0.03))} up width={260} height={40} />
      <div className="flex items-center justify-between mt-3">
        <p className="text-base font-bold mono">{fmtMoney(asset.price, asset.type, asset.symbol)}</p>
        <p className={cn('text-xs font-bold mono flex items-center gap-1', changeClass(asset.changePercent24h))}>
          <TrendingUp className="w-3 h-3" />
          {fmtPct(asset.changePercent24h)}
        </p>
      </div>
    </button>
  );
}
