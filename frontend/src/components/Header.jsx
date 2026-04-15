import { Plus, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

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

  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur border-b border-border">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-bg-soft border border-border flex items-center justify-center hover:bg-bg-elev transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-bg-soft border border-border flex items-center justify-center relative hover:bg-bg-elev transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-down" />
          </button>
        </div>
      </div>
    </header>
  );
}
