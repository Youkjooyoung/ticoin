import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import CandleChart from './charts/CandleChart.jsx';
import CommentPanel from './CommentPanel.jsx';
import { useBinanceKlines } from '../hooks/useBinanceKlines.js';
import { useMarketStore } from '../stores/marketStore.js';
import { cn, fmtPrice, fmtPct, fmtCompact, changeClass } from '../lib/utils.js';

const INTERVALS = ['15M', '1H', '4H', '1D', '1W'];

function generateMockCandles(seed = 100, length = 30) {
  const out = [];
  let prev = seed;
  for (let i = 0; i < length; i++) {
    const open = prev;
    const drift = (Math.sin(i * 0.7 + seed * 0.01) + Math.random() - 0.4) * seed * 0.015;
    const close = Math.max(0.1, open + drift);
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = seed * 1000 * (0.6 + Math.random());
    out.push({ open, high, low, close, volume });
    prev = close;
  }
  return out;
}

export default function AssetCard({ asset, onOpen }) {
  const [interval, setInterval] = useState('1H');
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const flash = useMarketStore((s) => s.flashes[asset.symbol]);

  const { candles: binanceCandles, loading: klinesLoading } = useBinanceKlines(
    asset.type === 'CRYPTO' ? asset.symbol : null,
    interval
  );

  const fallback = useMemo(
    () => generateMockCandles(asset.price || 100, 50),
    [asset.price, interval]
  );

  const candles = binanceCandles.length > 0 ? binanceCandles : fallback;

  const up = (asset.changePercent24h ?? 0) >= 0;
  const last = candles[candles.length - 1] || { open: 0, high: 0, low: 0, close: 0, volume: 0 };
  const ma = (period) => {
    if (candles.length < period) return null;
    const slice = candles.slice(-period);
    return slice.reduce((s, d) => s + d.close, 0) / period;
  };
  const ma7 = ma(7);
  const ma25 = ma(25);

  return (
    <article className="glass-card p-5 hover:border-border-strong transition-colors">
      <header className="flex items-start justify-between mb-4 cursor-pointer" onClick={() => onOpen?.(asset)}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-sm">
            {asset.symbol?.slice(0, 3)}
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">{asset.name}</h3>
            <p className="text-xs text-text-3 mono">{asset.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={cn(
              'text-lg font-extrabold mono flex items-center gap-1.5 transition-colors duration-300',
              flash === 'up' && 'text-up',
              flash === 'down' && 'text-down'
            )}
          >
            ${fmtPrice(asset.price, asset.price < 10 ? 4 : 2)}
            <span className={cn('w-1.5 h-1.5 rounded-full', up ? 'bg-up' : 'bg-down', 'animate-pulse')} />
          </p>
          <p className={cn('text-xs font-semibold mono', changeClass(asset.changePercent24h))}>
            {asset.change24h >= 0 ? '+' : ''}${fmtPrice(Math.abs(asset.change24h || 0))} ({fmtPct(asset.changePercent24h)})
          </p>
        </div>
      </header>

      <div className="flex items-center gap-3 text-[11px] mono mb-2">
        {ma7 && (
          <span className="flex items-center gap-1">
            <span className="text-[#F5A623]">MA7</span>
            <span className="text-text-2">{fmtPrice(ma7, ma7 < 10 ? 4 : 2)}</span>
          </span>
        )}
        {ma25 && (
          <span className="flex items-center gap-1">
            <span className="text-brand-light">MA25</span>
            <span className="text-text-2">{fmtPrice(ma25, ma25 < 10 ? 4 : 2)}</span>
          </span>
        )}
        <div className="ml-auto flex gap-3 text-text-3">
          <span>O <span className="text-text-1">{fmtPrice(last.open)}</span></span>
          <span>H <span className="text-up">{fmtPrice(last.high)}</span></span>
          <span>L <span className="text-down">{fmtPrice(last.low)}</span></span>
          <span>C <span className="text-text-1">{fmtPrice(last.close)}</span></span>
        </div>
      </div>

      <CandleChart data={candles} height={220} />

      <div className="flex gap-1 mt-3 p-1 bg-bg-soft rounded-lg w-fit">
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            onClick={() => setInterval(iv)}
            className={cn(
              'px-3 py-1 text-[11px] font-semibold rounded-md transition-colors mono',
              interval === iv ? 'bg-brand text-white' : 'text-text-3 hover:text-text-1'
            )}
          >
            {iv}
          </button>
        ))}
        {klinesLoading && (
          <span className="text-[10px] text-text-3 ml-2 self-center">로딩...</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
        <div>
          <p className="text-[11px] text-text-3 mb-0.5">시가총액</p>
          <p className="text-sm font-bold mono">${fmtCompact(asset.marketCap)}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-3 mb-0.5">거래량</p>
          <p className="text-sm font-bold mono">${fmtCompact(asset.volume24h)}</p>
        </div>
      </div>

      <footer className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-5">
          <button onClick={() => setLiked((v) => !v)} className="flex items-center gap-1.5 text-text-3 hover:text-down transition-colors">
            <Heart className={cn('w-5 h-5', liked && 'fill-down text-down')} />
            <span className="text-xs mono">{(12453 + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button
            onClick={() => setCommentOpen((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 transition-colors',
              commentOpen ? 'text-brand-light' : 'text-text-3 hover:text-text-1'
            )}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs mono">댓글</span>
          </button>
          <button className="text-text-3 hover:text-text-1 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => setSaved((v) => !v)} className="text-text-3 hover:text-brand-light transition-colors">
          <Bookmark className={cn('w-5 h-5', saved && 'fill-brand-light text-brand-light')} />
        </button>
      </footer>

      <CommentPanel symbol={asset.symbol} open={commentOpen} />
    </article>
  );
}
