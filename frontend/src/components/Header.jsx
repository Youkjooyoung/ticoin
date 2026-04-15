import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown.jsx';
import QuickCreateDropdown from './QuickCreateDropdown.jsx';

const TITLES = {
  '/': '피드',
  '/search': '검색',
  '/trending': '트렌딩',
  '/portfolio': '포트폴리오',
  '/watchlist': '관심목록',
  '/alerts': '가격 알림',
  '/profile': '프로필',
};

export default function Header() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? 'ticoin';
  const [createOpen, setCreateOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur border-b border-border">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
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
