import { useEffect, useRef } from 'react';
import { Plus, Wallet, Star, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const ITEMS = [
  { to: '/portfolio', icon: Wallet, label: '포트폴리오 추가', desc: '보유 자산 등록' },
  { to: '/watchlist', icon: Star, label: '관심목록 추가', desc: '가격 추적할 종목' },
  { to: '/alerts', icon: Bell, label: '가격 알림 등록', desc: '목표가 달성 알림' },
  { to: '/search', icon: Search, label: '종목 검색', desc: '코인/주식 찾기' },
];

export default function QuickCreateDropdown({ open, onClose, onOpen }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose]);

  return (
    <div className="relative">
      <button
        onClick={onOpen}
        className="w-9 h-9 rounded-full bg-bg-soft border border-border flex items-center justify-center hover:bg-bg-elev transition-colors"
        aria-label="빠른 생성"
      >
        <Plus className="w-4 h-4" />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 w-64 glass-card shadow-2xl z-50 overflow-hidden animate-[scaleIn_0.15s_ease-out] origin-top-right"
        >
          <div className="p-2 border-b border-border">
            <p className="text-[11px] font-bold text-text-3 px-2 py-1">빠른 메뉴</p>
          </div>
          <div className="py-1">
            {ITEMS.map(({ to, icon: Icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-soft transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-soft flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="text-[10px] text-text-3 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
