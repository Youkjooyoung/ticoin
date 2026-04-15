import { useEffect, useMemo, useState } from 'react';
import { Search as SearchIcon, Clock, TrendingUp as TrendIcon, Loader2, X } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useBinanceTicker } from '../hooks/useBinanceTicker.js';
import MiniChart from '../components/charts/MiniChart.jsx';
import AssetDetailModal from '../components/AssetDetailModal.jsx';
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
  const [selected, setSelected] = useState(null);
  const [focused, setFocused] = useState(false);

  const debouncedQ = useDebounce(q, 300);
  const isTyping = q !== debouncedQ;

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const cryptoSymbols = useMemo(
    () => feed.filter((a) => a.type === 'CRYPTO').map((a) => a.symbol),
    [feed]
  );
  useBinanceTicker(cryptoSymbols);

  const suggestions = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return feed
      .filter((a) =>
        a.name.toLowerCase().includes(ql) || a.symbol.toLowerCase().includes(ql)
      )
      .slice(0, 8);
  }, [q, feed]);

  const filtered = useMemo(() => {
    if (debouncedQ) {
      const ql = debouncedQ.toLowerCase();
      return feed.filter((a) =>
        a.name.toLowerCase().includes(ql) || a.symbol.toLowerCase().includes(ql)
      );
    }
    return tab === 'trending' ? feed : recent;
  }, [debouncedQ, tab, feed, recent]);

  const onPick = (a) => {
    setRecent((r) => [a, ...r.filter((x) => x.symbol !== a.symbol)].slice(0, 8));
    setSelected(a);
    setFocused(false);
  };

  const clearInput = () => { setQ(''); setFocused(false); };

  return (
    <div className="space-y-5">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="종목 또는 코인 검색"
          className="w-full h-12 pl-11 pr-11 rounded-xl bg-bg-elev border border-border text-sm outline-none focus:border-brand"
        />
        {q && (
          <button
            onMouseDown={(e) => { e.preventDefault(); clearInput(); }}
            className="absolute right-11 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 transition-colors"
            aria-label="지우기"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isTyping && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light animate-spin" />
        )}

        {focused && q && suggestions.length > 0 && (
          <div className="absolute top-14 left-0 right-0 glass-card shadow-2xl z-20 max-h-[320px] overflow-y-auto">
            {suggestions.map((a) => (
              <button
                key={a.symbol}
                onMouseDown={(e) => { e.preventDefault(); onPick(a); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-soft transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-[10px] shrink-0">
                  {a.symbol?.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">{a.name}</p>
                  <p className="text-[10px] text-text-3 mono">{a.symbol} · {a.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold mono">${fmtPrice(a.price)}</p>
                  <p className={cn('text-[10px] font-semibold mono', changeClass(a.changePercent24h))}>
                    {fmtPct(a.changePercent24h)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!debouncedQ && (
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
          <p className="text-center text-sm text-text-3 py-10">
            {debouncedQ ? '결과가 없습니다' : '최근 검색 기록이 없습니다'}
          </p>
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

      {selected && <AssetDetailModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
