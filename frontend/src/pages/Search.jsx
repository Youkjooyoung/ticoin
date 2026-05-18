import { useEffect, useMemo, useState } from 'react';
import { Clock, Loader2, Search as SearchIcon, TrendingUp as TrendIcon, X } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { useDebounce } from '../hooks/useDebounce.js';
import MiniChart from '../components/charts/MiniChart.jsx';
import AssetDetailModal from '../components/AssetDetailModal.jsx';
import { changeClass, cn, displaySymbol, fmtMoney, fmtPct } from '../lib/utils.js';

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

  const suggestions = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    return feed
      .filter((a) => a.name.toLowerCase().includes(ql) || a.symbol.toLowerCase().includes(ql))
      .slice(0, 8);
  }, [q, feed]);

  const filtered = useMemo(() => {
    if (debouncedQ) {
      const ql = debouncedQ.toLowerCase();
      return feed.filter((a) => a.name.toLowerCase().includes(ql) || a.symbol.toLowerCase().includes(ql));
    }
    return tab === 'trending' ? feed : recent;
  }, [debouncedQ, tab, feed, recent]);

  const onPick = (asset) => {
    setRecent((list) => [asset, ...list.filter((x) => x.symbol !== asset.symbol)].slice(0, 8));
    setSelected(asset);
    setFocused(false);
  };

  return (
    <div className="space-y-5">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="BTC, 비트코인, AAPL 검색"
          className="w-full h-12 pl-11 pr-11 rounded-lg bg-bg-elev border border-border text-sm outline-none focus:border-brand"
        />
        {q && (
          <button onMouseDown={(e) => { e.preventDefault(); setQ(''); }} className="absolute right-11 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 transition-colors" aria-label="검색어 지우기">
            <X className="w-4 h-4" />
          </button>
        )}
        {isTyping && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-light animate-spin" />}

        {focused && q && suggestions.length > 0 && (
          <div className="absolute top-14 left-0 right-0 glass-card shadow-2xl z-20 max-h-[320px] overflow-y-auto">
            {suggestions.map((asset) => (
              <AssetRow key={asset.symbol} asset={asset} onClick={() => onPick(asset)} compact />
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
              className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors', tab === key ? 'bg-brand text-white' : 'bg-bg-elev text-text-2 hover:text-text-1')}
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
            {debouncedQ ? '검색 결과가 없습니다.' : '최근 검색 항목이 없습니다.'}
          </p>
        )}
        {filtered.map((asset) => (
          <AssetRow key={asset.symbol} asset={asset} onClick={() => onPick(asset)} />
        ))}
      </div>

      {selected && <AssetDetailModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AssetRow({ asset, onClick, compact = false }) {
  const sparkline = asset.sparkline?.length
    ? asset.sparkline
    : Array.from({ length: 20 }, (_, i) => (asset.price || 1) * (1 + Math.sin(i) * 0.02));

  return (
    <button onMouseDown={(e) => compact && e.preventDefault()} onClick={onClick} className="w-full glass-card p-4 flex items-center gap-4 hover:border-border-strong transition-colors text-left">
      <div className="w-10 h-10 rounded-lg gradient-brand-bg flex items-center justify-center font-extrabold text-xs text-white shrink-0">
        {displaySymbol(asset.symbol).slice(0, 3)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{asset.name}</p>
        <p className="text-xs text-text-3 mono">{displaySymbol(asset.symbol)} · {asset.type}</p>
      </div>
      {!compact && <MiniChart data={sparkline} up={asset.changePercent24h >= 0} />}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold mono">{fmtMoney(asset.price, asset.type, asset.symbol)}</p>
        <p className={cn('text-xs font-semibold mono', changeClass(asset.changePercent24h))}>{fmtPct(asset.changePercent24h)}</p>
      </div>
    </button>
  );
}
