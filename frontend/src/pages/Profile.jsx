import { useEffect, useState } from 'react';
import { User, Settings, Bell, Moon, HelpCircle, LogOut, ChevronRight, Newspaper, ExternalLink } from 'lucide-react';
import { newsApi } from '../api/market.js';

const STATS = [
  { label: '팔로워', value: '1.2K' },
  { label: '팔로잉', value: '342' },
  { label: '포스트', value: '87' },
];

const MENU = [
  { icon: Settings, label: '계정 설정' },
  { icon: Bell, label: '알림 설정' },
  { icon: Moon, label: '다크 모드', toggle: true, value: true },
  { icon: HelpCircle, label: '도움말' },
  { icon: LogOut, label: '로그아웃', danger: true },
];

export default function Profile() {
  const [news, setNews] = useState([]);
  const [newsError, setNewsError] = useState(false);

  useEffect(() => {
    newsApi.list()
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setNews(d.slice(0, 5));
        else setNewsError(true);
      })
      .catch(() => setNewsError(true));
  }, []);

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 text-center">
        <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center mb-3">
          <User className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-lg font-extrabold">guest_trader</h3>
        <p className="text-xs text-text-3 mt-1">암호화폐 & 주식 투자자 · Seoul 🇰🇷</p>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {STATS.map((s) => (
            <div key={s.label} className="py-3 rounded-xl bg-bg-soft">
              <p className="text-lg font-extrabold mono">{s.value}</p>
              <p className="text-[11px] text-text-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
          <Newspaper className="w-4 h-4 text-brand-light" /> 최신 크립토 뉴스
        </h4>
        {newsError && (
          <div className="glass-card p-4 text-xs text-text-3">
            뉴스를 불러오지 못했습니다. 백엔드 또는 외부 API를 확인해주세요.
          </div>
        )}
        <div className="glass-card divide-y divide-border">
          {news.map((n) => (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="block p-4 hover:bg-bg-soft transition-colors"
            >
              <div className="flex items-start gap-3">
                {n.imageUrl && (
                  <img src={n.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2">{n.title}</p>
                  <p className="text-[11px] text-text-3 mt-1 flex items-center gap-1">
                    <span>{n.source}</span>
                    <ExternalLink className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </a>
          ))}
          {news.length === 0 && !newsError && (
            <p className="text-center text-xs text-text-3 py-6">로딩 중...</p>
          )}
        </div>
      </section>

      <section className="glass-card divide-y divide-border">
        {MENU.map(({ icon: Icon, label, danger, toggle, value }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 p-4 text-sm transition-colors hover:bg-bg-soft ${
              danger ? 'text-down' : 'text-text-1'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="flex-1 text-left">{label}</span>
            {toggle ? (
              <span className={`w-9 h-5 rounded-full p-0.5 transition-colors ${value ? 'bg-brand' : 'bg-bg-soft'}`}>
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : ''}`} />
              </span>
            ) : (
              <ChevronRight className="w-4 h-4 text-text-3" />
            )}
          </button>
        ))}
      </section>
    </div>
  );
}
