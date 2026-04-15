import { ChevronDown } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { cn, fmtPrice } from '../lib/utils.js';

export default function SymbolSelect({ value, onChange, className, placeholder = '심볼을 선택하세요' }) {
  const feed = useMarketStore((s) => s.feed);

  return (
    <div className={cn('relative', className)}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none h-9 pl-3 pr-9 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand cursor-pointer hover:border-border-strong transition-colors"
      >
        <option value="" disabled>{placeholder}</option>
        {feed.map((a) => (
          <option key={a.symbol} value={a.symbol}>
            {a.symbol} · {a.name} (${fmtPrice(a.price, a.price < 10 ? 4 : 2)})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3 pointer-events-none" />
    </div>
  );
}
