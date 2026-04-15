import { useEffect, useMemo, useState } from 'react';
import { X, Star, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import CandleChart from './charts/CandleChart.jsx';
import { marketApi, watchlistApi, portfolioApi } from '../api/market.js';
import { useToastStore } from '../stores/toastStore.js';
import { cn, fmtPrice, fmtPct, fmtCompact, changeClass } from '../lib/utils.js';

const INTERVALS = ['15M', '1H', '4H', '1D', '1W'];

function generateMockCandles(seed = 100, length = 60) {
  const out = [];
  let prev = seed;
  for (let i = 0; i < length; i++) {
    const open = prev;
    const drift = (Math.sin(i * 0.4 + seed * 0.01) + Math.random() - 0.4) * seed * 0.012;
    const close = Math.max(0.1, open + drift);
    const high = Math.max(open, close) * (1 + Math.random() * 0.012);
    const low = Math.min(open, close) * (1 - Math.random() * 0.012);
    const volume = seed * 1000 * (0.6 + Math.random());
    out.push({ open, high, low, close, volume });
    prev = close;
  }
  return out;
}

export default function AssetDetailModal({ asset, onClose }) {
  const [interval, setInterval] = useState('1H');
  const [candles, setCandles] = useState([]);
  const [closing, setClosing] = useState(false);
  const toast = useToastStore();

  const fallback = useMemo(() => generateMockCandles(asset?.price || 100, 60), [asset?.price]);

  useEffect(() => {
    if (!asset) return;
    let ignore = false;
    marketApi
      .candles(asset.type === 'CRYPTO' ? asset.name?.toLowerCase() : asset.symbol, asset.type, interval)
      .then((d) => {
        if (ignore) return;
        if (Array.isArray(d) && d.length > 3) setCandles(d);
        else setCandles(fallback);
      })
      .catch(() => setCandles(fallback));
    return () => { ignore = true; };
  }, [asset, interval, fallback]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
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
      await watchlistApi.create({
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        alertEnabled: true,
      });
      toast.success(`${asset.symbol}을(를) 관심목록에 추가했습니다`);
    } catch {
      toast.error('관심목록 추가에 실패했습니다 (백엔드 미기동 가능성)');
    }
  };

  const addToPortfolio = async () => {
    const q = window.prompt(`${asset.symbol} 수량`, '1');
    if (!q) return;
    const p = window.prompt(`${asset.symbol} 평균 매수가`, String(asset.price));
    if (!p) return;
    try {
      await portfolioApi.create({
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        quantity: Number(q),
        avgPrice: Number(p),
      });
      toast.success(`${asset.symbol}을(를) 포트폴리오에 추가했습니다`);
    } catch {
      toast.error('포트폴리오 추가에 실패했습니다 (백엔드 미기동 가능성)');
    }
  };

  if (!asset) return null;

  const up = (asset.changePercent24h ?? 0) >= 0;
  const last = candles[candles.length - 1] || { open: 0, high: 0, low: 0, close: 0 };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md',
        closing ? 'animate-[fadeIn_0.2s_ease-out_reverse]' : 'animate-[fadeIn_0.2s_ease-out]'
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          'glass-card max-w-[900px] w-full max-h-[92vh] overflow-hidden flex flex-col',
          closing ? 'animate-[scaleIn_0.18s_ease-out_reverse]' : 'animate-[scaleIn_0.22s_ease-out]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center font-extrabold text-sm">
              {asset.symbol?.slice(0, 3)}
            </div>
            <div>
              <h3 className="text-xl font-extrabold">{asset.name}</h3>
              <p className="text-xs text-text-3 mono">{asset.symbol} · {asset.type}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-bg-soft border border-border flex items-center justify-center hover:bg-bg-elev transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <p className="text-3xl font-extrabold mono">${fmtPrice(asset.price, asset.price < 10 ? 4 : 2)}</p>
              <p className={cn('text-sm font-semibold mono flex items-center gap-1 mt-1', changeClass(asset.changePercent24h))}>
                {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {asset.change24h >= 0 ? '+' : ''}${fmtPrice(Math.abs(asset.change24h || 0))} ({fmtPct(asset.changePercent24h)})
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addToWatchlist}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-bg-soft border border-border text-sm font-semibold hover:bg-brand-soft hover:border-brand hover:text-brand-light transition-colors"
              >
                <Star className="w-4 h-4" /> 관심목록
              </button>
              <button
                onClick={addToPortfolio}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors"
              >
                <Plus className="w-4 h-4" /> 포트폴리오
              </button>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-bg-soft rounded-lg w-fit">
            {INTERVALS.map((iv) => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors mono',
                  interval === iv ? 'bg-brand text-white' : 'text-text-3 hover:text-text-1'
                )}
              >
                {iv}
              </button>
            ))}
          </div>

          <CandleChart data={candles} height={380} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatBox label="24H 고가" value={`$${fmtPrice(asset.high24h)}`} color="text-up" />
            <StatBox label="24H 저가" value={`$${fmtPrice(asset.low24h)}`} color="text-down" />
            <StatBox label="시가총액" value={`$${fmtCompact(asset.marketCap)}`} />
            <StatBox label="거래량" value={`$${fmtCompact(asset.volume24h)}`} />
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
