import { NavLink } from 'react-router-dom';
import { Home, Search, TrendingUp, Wallet, User } from 'lucide-react';
import { cn } from '../lib/utils.js';

const NAV = [
  { to: '/', label: '홈', icon: Home },
  { to: '/search', label: '검색', icon: Search },
  { to: '/trending', label: '트렌딩', icon: TrendingUp },
  { to: '/portfolio', label: '포폴', icon: Wallet },
  { to: '/profile', label: '프로필', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-elev/95 backdrop-blur border-t border-border">
      <ul className="flex justify-around items-center h-16 px-2">
        {NAV.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[10px]',
                  isActive ? 'text-brand-light' : 'text-text-3'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
