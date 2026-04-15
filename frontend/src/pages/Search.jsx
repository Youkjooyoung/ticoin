import { useEffect, useState } from 'react';
import { Search as SearchIcon, Clock, TrendingUp as TrendIcon } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import MiniChart from '../components/charts/MiniChart.jsx';
import { cn, fmtPrice, fmtPct, changeClass } from '../lib/utils.js';

const TABS = [
  { key: 'trending', label: '트렌딩', icon: TrendIcon },
  { key: 'recent', label: '최근 검색', icon: Clock },
];

export default function Search() {
  const { feed, loadFeed } = useMarketStore();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('trending');
  const [recent, setRecent] = useState([]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const filtered = q
    ? feed.filter((a) =>
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.symbol.toLowerCase().includes(q.toLowerCase())
      )
    : (tab === 'trending' ? feed : recent);

  const onPick = (a) => {
    setRecent((r) => [a, ...r.filter((x) => x.symbol !== a.symbol)].slice(0, 8));
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="종목 또는 코인 검색"
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-bg-elev border border-border text-sm outline-none focus:border-brand"
        />
      </div>

      {!q && (
        <div className="flex gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors',
                tab === key ? 'bg-brand text-white' : 'bg-bg-elev text-text-2 hover:text-text-1'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-3 py-10">결과가 없습니다</p>
        )}
        {filtered.map((a) => (
          <button
            key={a.symbol}
            onClick={() => onPick(a)}
            className="w-full glass-card p-4 flex items-center gap-4 hover:border-border-strong transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-xs">
              {a.symbol?.slice(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{a.name}</p>
              <p className="text-xs text-text-3 mono">{a.symbol} · {a.type}</p>
            </div>
            <MiniChart data={a.sparkline?.length ? a.sparkline : Array.from({ length: 20 }, (_, i) => a.price * (1 + Math.sin(i) * 0.02))} up={a.changePercent24h >= 0} />
            <div className="text-right">
              <p className="text-sm font-bold mono">${fmtPrice(a.price)}</p>
              <p className={cn('text-xs font-semibold mono', changeClass(a.changePercent24h))}>
                {fmtPct(a.changePercent24h)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
