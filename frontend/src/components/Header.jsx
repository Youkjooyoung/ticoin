import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotificationDropdown from './NotificationDropdown.jsx';
import QuickCreateDropdown from './QuickCreateDropdown.jsx';

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

  return (
    <header className="sticky top-0 z-20 bg-bg/88 backdrop-blur border-b border-border">
      <div className="max-w-[1180px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="hidden sm:block text-[11px] text-text-3 mt-0.5">Upbit KRW market · Yahoo stocks · OpenAI analysis</p>
        </div>
        <div className="flex items-center gap-2">
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
