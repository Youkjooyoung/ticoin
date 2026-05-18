import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, TrendingUp, Wallet, Star, Bell, User, Settings } from 'lucide-react';
import { cn } from '../lib/utils.js';

const NAV = [
  { to: '/', key: 'nav.home', icon: Home },
  { to: '/search', key: 'nav.search', icon: Search },
  { to: '/trending', key: 'nav.trending', icon: TrendingUp },
  { to: '/portfolio', key: 'nav.portfolio', icon: Wallet },
  { to: '/watchlist', key: 'nav.watchlist', icon: Star },
  { to: '/alerts', key: 'nav.alerts', icon: Bell },
  { to: '/profile', key: 'nav.profile', icon: User },
];

export default function Sidebar() {
  const { t } = useTranslation();
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-surface-1/95 backdrop-blur z-30">
      <NavLink to="/" end className="block px-6 pt-8 pb-6 hover:opacity-90 transition-opacity">
        <h1 className="text-2xl font-extrabold gradient-text">{t('app.name')}</h1>
        <p className="text-xs text-text-3 mt-1 leading-relaxed">{t('app.tagline')}</p>
      </NavLink>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, key, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-soft text-brand-light font-semibold'
                  : 'text-text-2 hover:bg-bg-soft hover:text-text-1'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('w-5 h-5', isActive && 'text-brand-light')} />
                <span>{t(key)}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-[var(--border)]">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              isActive
                ? 'bg-brand-soft text-brand-light font-semibold'
                : 'text-text-2 hover:bg-bg-soft hover:text-text-1'
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </aside>
  );
}
