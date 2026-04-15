import { cn, fmtPct } from '../lib/utils.js';

export default function StoryBar({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
      {items.map((a) => {
        const up = a.changePercent24h >= 0;
        return (
          <div key={a.symbol} className="flex flex-col items-center shrink-0 w-[72px]">
            <div
              className={cn(
                'w-16 h-16 rounded-full p-[2px] transition-transform hover:scale-105',
                up
                  ? 'bg-gradient-to-br from-up/80 via-up to-up/60'
                  : 'bg-gradient-to-br from-down/80 via-down to-down/60'
              )}
            >
              <div className="w-full h-full rounded-full bg-bg-elev flex flex-col items-center justify-center">
                <span className="text-[11px] font-extrabold tracking-tight">{a.symbol}</span>
              </div>
            </div>
            <p className="mt-1.5 text-[10px] text-text-2 truncate w-full text-center">{a.name}</p>
            <p className={cn('text-[10px] font-semibold', up ? 'text-up' : 'text-down')}>
              {fmtPct(a.changePercent24h)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
