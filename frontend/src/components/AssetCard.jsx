import { useMemo, useState } from 'react';
import { Bookmark, Heart, MessageCircle, Share2 } from 'lucide-react';
import CandleChart from './charts/CandleChart.jsx';
import CommentPanel from './CommentPanel.jsx';
import { useBinanceKlines } from '../hooks/useBinanceKlines.js';
import { useMarketKlines } from '../hooks/useMarketKlines.js';
import { useMarketStore } from '../stores/marketStore.js';
import { changeClass, cn, displaySymbol, fmtMoney, fmtPct, fmtVolume, pairSymbol } from '../lib/utils.js';

const INTERVALS = ['15M', '1H', '4H', '1D', '1W'];

function generateFallbackCandles(seed = 100, length = 48) {
  const out = [];
  let prev = Number(seed) || 100;
  for (let i = 0; i < length; i++) {
    const open = prev;
    const drift = Math.sin(i * 0.7 + seed * 0.01) * seed * 0.006;
    const close = Math.max(0.1, open + drift);
    const high = Math.max(open, close) * 1.006;
    const low = Math.min(open, close) * 0.994;
    out.push({ open, high, low, close, volume: seed * 1000 });
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
  const isCrypto = asset.type === 'CRYPTO';

  const binance = useBinanceKlines(isCrypto ? asset.symbol : null, interval, 100);
  const market = useMarketKlines(asset.symbol, interval, 100, asset.type);
  const sourceCandles = isCrypto ? binance.candles : market.candles;
  const loading = isCrypto ? binance.loading : market.loading;
  const fallback = useMemo(() => generateFallbackCandles(asset.price || 100), [asset.price]);
  const candles = sourceCandles.length > 0 ? sourceCandles : fallback;

  return (
    <article className="glass-card overflow-hidden">
      <header className="p-4 flex items-start justify-between gap-4 cursor-pointer" onClick={() => onOpen?.(asset)}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg gradient-brand-bg flex items-center justify-center font-extrabold text-xs text-white shrink-0">
            {displaySymbol(asset.symbol).slice(0, 3)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base leading-tight truncate">{asset.name}</h3>
            <p className="text-xs text-text-3 mono">{pairSymbol(asset.symbol, asset.type)} · {asset.type}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={cn('text-lg font-extrabold mono transition-colors', flash === 'up' && 'text-up', flash === 'down' && 'text-down')}>
            {fmtMoney(asset.price, asset.type)}
          </p>
          <p className={cn('text-xs font-semibold mono', changeClass(asset.changePercent24h))}>
            {asset.change24h >= 0 ? '+' : ''}{fmtMoney(Math.abs(asset.change24h || 0), asset.type)} · {fmtPct(asset.changePercent24h)}
          </p>
        </div>
      </header>

      <div className="px-4">
        <div className="flex items-center justify-between text-[11px] text-text-3 mb-2">
          <span className="mono">{isCrypto ? 'Binance live market data' : 'Yahoo market data'}</span>
          {loading && <span>차트 갱신 중</span>}
        </div>
        <CandleChart data={candles} height={220} />
      </div>

      <div className="px-4 pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-1 bg-bg-soft rounded-lg">
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
        </div>
        <div className="grid grid-cols-2 gap-4 text-right text-xs">
          <div>
            <p className="text-text-3">24H 고가</p>
            <p className="font-bold mono text-up">{fmtMoney(asset.high24h, asset.type)}</p>
          </div>
          <div>
            <p className="text-text-3">24H 거래대금</p>
            <p className="font-bold mono">{fmtVolume(asset.volume24h, asset.type)}</p>
          </div>
        </div>
      </div>

      <footer className="m-4 pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button onClick={() => setLiked((v) => !v)} className="flex items-center gap-1.5 text-text-3 hover:text-up transition-colors">
            <Heart className={cn('w-5 h-5', liked && 'fill-up text-up')} />
            <span className="text-xs mono">{(12453 + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button onClick={() => setCommentOpen((v) => !v)} className={cn('flex items-center gap-1.5 transition-colors', commentOpen ? 'text-brand-light' : 'text-text-3 hover:text-text-1')}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">댓글</span>
          </button>
          <button className="text-text-3 hover:text-text-1 transition-colors" aria-label="공유">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        <button onClick={() => setSaved((v) => !v)} className="text-text-3 hover:text-brand-light transition-colors" aria-label="저장">
          <Bookmark className={cn('w-5 h-5', saved && 'fill-brand-light text-brand-light')} />
        </button>
      </footer>

      <CommentPanel symbol={asset.symbol} open={commentOpen} />
    </article>
  );
}
