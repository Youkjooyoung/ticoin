import { NavLink } from 'react-router-dom';
import { Home, Search, TrendingUp, Wallet, Star, Bell, User, Settings } from 'lucide-react';
import { cn } from '../lib/utils.js';

const NAV = [
  { to: '/', label: '홈', icon: Home },
  { to: '/search', label: '검색', icon: Search },
  { to: '/trending', label: '트렌딩', icon: TrendingUp },
  { to: '/portfolio', label: '포트폴리오', icon: Wallet },
  { to: '/watchlist', label: '관심목록', icon: Star },
  { to: '/alerts', label: '가격 알림', icon: Bell },
  { to: '/profile', label: '프로필', icon: User },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-border bg-bg-elev z-30">
      <div className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-extrabold gradient-text">ticoin</h1>
        <p className="text-xs text-text-3 mt-1">주식 & 코인 소셜</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors',
                isActive
                  ? 'bg-brand-soft text-brand-light font-semibold'
                  : 'text-text-2 hover:bg-bg-soft hover:text-text-1'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5', isActive && 'text-brand-light')} />
                <span>{label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-2 hover:bg-bg-soft hover:text-text-1 transition-colors">
          <Settings className="w-5 h-5" />
          <span>설정</span>
        </button>
      </div>
    </aside>
  );
}
