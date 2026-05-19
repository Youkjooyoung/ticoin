import { useEffect, useMemo, useState } from 'react';
import { Plus, Star, TrendingDown, TrendingUp, X } from 'lucide-react';
import CandleChart from './charts/CandleChart.jsx';
import { portfolioApi, watchlistApi } from '../api/market.js';
import { useBinanceKlines } from '../hooks/useBinanceKlines.js';
import { useMarketKlines } from '../hooks/useMarketKlines.js';
import { useToastStore } from '../stores/toastStore.js';
import { changeClass, cn, displaySymbol, fmtMoney, fmtPct, fmtPrice, fmtVolume, pairSymbol } from '../lib/utils.js';

const INTERVALS = ['15M', '1H', '4H', '1D', '1W'];

function generateFallbackCandles(seed = 100, length = 60) {
  const out = [];
  let prev = Number(seed) || 100;
  for (let i = 0; i < length; i++) {
    const open = prev;
    const drift = Math.sin(i * 0.4 + seed * 0.01) * seed * 0.006;
    const close = Math.max(0.1, open + drift);
    out.push({ open, high: Math.max(open, close) * 1.008, low: Math.min(open, close) * 0.992, close, volume: seed * 1000 });
    prev = close;
  }
  return out;
}

export default function AssetDetailModal({ asset, onClose }) {
  const [interval, setInterval] = useState('1H');
  const [closing, setClosing] = useState(false);
  const toast = useToastStore();
  const isCrypto = asset?.type === 'CRYPTO';
  const binance = useBinanceKlines(isCrypto ? asset?.symbol : null, interval, 140);
  const market = useMarketKlines(asset?.symbol, interval, 140, asset?.type);
  const sourceCandles = isCrypto ? binance.candles : market.candles;
  const fallback = useMemo(() => generateFallbackCandles(asset?.price || 100), [asset?.price]);
  const candles = sourceCandles.length > 0 ? sourceCandles : fallback;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose?.(), 180);
  };

  const addToWatchlist = async () => {
    try {
      await watchlistApi.create({ symbol: asset.symbol, name: asset.name, type: asset.type, alertEnabled: true });
      toast.success(`${displaySymbol(asset.symbol)} 관심목록에 추가했습니다.`);
    } catch {
      toast.error('관심목록 추가에 실패했습니다.');
    }
  };

  const addToPortfolio = async () => {
    const quantity = window.prompt(`${displaySymbol(asset.symbol)} 수량`, '1');
    if (!quantity) return;
    const avgPrice = window.prompt(`${displaySymbol(asset.symbol)} 평균 단가`, String(asset.price));
    if (!avgPrice) return;
    try {
      await portfolioApi.create({ symbol: asset.symbol, name: asset.name, type: asset.type, quantity: Number(quantity), avgPrice: Number(avgPrice) });
      toast.success(`${displaySymbol(asset.symbol)} 포트폴리오에 추가했습니다.`);
    } catch {
      toast.error('포트폴리오 추가에 실패했습니다.');
    }
  };

  if (!asset) return null;

  const up = (asset.changePercent24h ?? 0) >= 0;
  const last = candles[candles.length - 1] || { open: 0, high: 0, low: 0, close: 0 };

  return (
    <div className={cn('fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md', closing ? 'animate-[fadeIn_0.2s_ease-out_reverse]' : 'animate-[fadeIn_0.2s_ease-out]')} onClick={handleClose}>
      <div className={cn('glass-card max-w-[960px] w-full max-h-[92vh] overflow-hidden flex flex-col', closing ? 'animate-[scaleIn_0.18s_ease-out_reverse]' : 'animate-[scaleIn_0.22s_ease-out]')} onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg gradient-brand-bg flex items-center justify-center font-extrabold text-sm text-white shrink-0">
              {displaySymbol(asset.symbol).slice(0, 3)}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold truncate">{asset.name}</h3>
              <p className="text-xs text-text-3 mono">{pairSymbol(asset.symbol, asset.type)} · {isCrypto ? 'Binance live' : 'Yahoo'}</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-9 h-9 rounded-lg bg-bg-soft border border-border flex items-center justify-center hover:bg-bg-elev transition-colors" aria-label="닫기">
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-3xl font-extrabold mono">{fmtMoney(asset.price, asset.type)}</p>
              <p className={cn('text-sm font-semibold mono flex items-center gap-1 mt-1', changeClass(asset.changePercent24h))}>
                {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {asset.change24h >= 0 ? '+' : ''}{fmtMoney(Math.abs(asset.change24h || 0), asset.type)} · {fmtPct(asset.changePercent24h)}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={addToWatchlist} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-soft border border-border text-sm font-semibold hover:bg-brand-soft hover:border-brand hover:text-brand-light transition-colors">
                <Star className="w-4 h-4" /> 관심목록
              </button>
              <button onClick={addToPortfolio} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors">
                <Plus className="w-4 h-4" /> 포트폴리오
              </button>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-bg-soft rounded-lg w-fit">
            {INTERVALS.map((iv) => (
              <button key={iv} onClick={() => setInterval(iv)} className={cn('px-3 py-1.5 text-xs font-semibold rounded-md transition-colors mono', interval === iv ? 'bg-brand text-white' : 'text-text-3 hover:text-text-1')}>
                {iv}
              </button>
            ))}
          </div>

          <CandleChart data={candles} height={380} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="24H 고가" value={fmtMoney(asset.high24h, asset.type)} color="text-up" />
            <StatBox label="24H 저가" value={fmtMoney(asset.low24h, asset.type)} color="text-down" />
            <StatBox label="시가총액" value={asset.marketCap ? fmtVolume(asset.marketCap, asset.type) : '-'} />
            <StatBox label="거래대금" value={fmtVolume(asset.volume24h, asset.type)} />
          </div>

          <div className="grid grid-cols-4 gap-3 text-xs mono pt-3 border-t border-border">
            <div><span className="text-text-3">O </span><span>{fmtPrice(last.open)}</span></div>
            <div><span className="text-text-3">H </span><span className="text-up">{fmtPrice(last.high)}</span></div>
            <div><span className="text-text-3">L </span><span className="text-down">{fmtPrice(last.low)}</span></div>
            <div><span className="text-text-3">C </span><span>{fmtPrice(last.close)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'text-text-1' }) {
  return (
    <div className="bg-bg-soft rounded-lg p-3">
      <p className="text-[10px] text-text-3 uppercase tracking-wide mb-1">{label}</p>
      <p className={cn('text-sm font-bold mono', color)}>{value}</p>
    </div>
  );
}
