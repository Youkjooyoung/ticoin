import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, UserCircle } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown.jsx';
import QuickCreateDropdown from './QuickCreateDropdown.jsx';
import { useAuthStore } from '../stores/authStore.js';

const TITLE_KEYS = {
  '/': 'home.feedTitle',
  '/search': 'nav.search',
  '/trending': 'nav.trending',
  '/portfolio': 'nav.portfolio',
  '/watchlist': 'nav.watchlist',
  '/alerts': 'nav.alerts',
  '/profile': 'nav.profile',
  '/settings': 'nav.settings',
};

export default function Header() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const title = TITLE_KEYS[pathname] ? t(TITLE_KEYS[pathname]) : t('app.name');
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { token, user, loadMe, logout } = useAuthStore();

  useEffect(() => {
    loadMe();
  }, [loadMe, token]);

  return (
    <header className="sticky top-0 z-20 bg-bg/88 backdrop-blur border-b border-border">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="hidden sm:block text-[11px] text-text-3 mt-0.5">Binance live crypto · Yahoo stocks · OpenAI analysis</p>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden sm:inline-flex h-9 px-3 rounded-lg border border-border bg-bg-elev text-sm font-semibold items-center gap-2 hover:border-border-strong"
              >
                <UserCircle className="w-4 h-4" />
                <span>{user.name || user.email}</span>
              </Link>
              <button
                onClick={logout}
                className="h-9 w-9 rounded-full border border-border bg-bg-elev flex items-center justify-center hover:border-border-strong"
                aria-label="로그아웃"
              >
                <LogOut className="w-4 h-4 text-text-2" />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="h-9 px-3 rounded-lg bg-brand text-white text-sm font-bold inline-flex items-center gap-2 hover:bg-brand-dark"
            >
              <LogIn className="w-4 h-4" />
              로그인
            </Link>
          )}
          <QuickCreateDropdown
            open={createOpen}
            onOpen={() => { setCreateOpen((v) => !v); setNotifOpen(false); }}
            onClose={() => setCreateOpen(false)}
          />
          <NotificationDropdown
            open={notifOpen}
            onOpen={() => { setNotifOpen((v) => !v); setCreateOpen(false); }}
            onClose={() => setNotifOpen(false)}
          />
        </div>
      </div>
    </header>
  );
}
