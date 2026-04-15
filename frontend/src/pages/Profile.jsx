import { useEffect, useRef, useState } from 'react';
import { User, Settings, Bell, Moon, HelpCircle, LogOut, ChevronRight, Newspaper, ExternalLink, Pencil, Camera, Check, X } from 'lucide-react';
import { newsApi } from '../api/market.js';
import NewsSkeleton from '../components/skeletons/NewsSkeleton.jsx';
import { useProfileStore } from '../stores/profileStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { useMarketStore } from '../stores/marketStore.js';
import { cn } from '../lib/utils.js';

const STATS = [
  { label: '팔로워', value: '1.2K' },
  { label: '팔로잉', value: '342' },
  { label: '포스트', value: '87' },
];

export default function Profile() {
  const { profile, loading, load, update } = useProfileStore();
  const toast = useToastStore();
  const feed = useMarketStore((s) => s.feed);

  const [news, setNews] = useState([]);
  const [newsError, setNewsError] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarData, setAvatarData] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const fileRef = useRef(null);

  // 모달 상태
  const [modal, setModal] = useState(null); // 'account' | 'notifications' | 'help' | 'logout'

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setBio(profile.bio || '');
      setAvatarData(profile.avatarUrl || '');
    }
  }, [profile]);

  useEffect(() => {
    newsApi.list()
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) setNews(d.slice(0, 5));
        else setNewsError(true);
      })
      .catch(() => setNewsError(true));
  }, []);

  const saveProfile = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요');
      return;
    }
    try {
      await update({ nickname: nickname.trim(), bio: bio.trim(), avatarUrl: avatarData || null });
      toast.success('프로필이 저장되었습니다');
      setEditOpen(false);
    } catch (err) {
      toast.error('저장 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const pickAvatar = () => fileRef.current?.click();

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error('이미지는 500KB 이하만 가능합니다');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarData(reader.result);
    reader.readAsDataURL(file);
  };

  const toggleNotif = () => {
    setNotifEnabled((v) => !v);
    toast.info(notifEnabled ? '알림이 꺼졌습니다' : '알림이 켜졌습니다');
  };

  const toggleDark = () => {
    setDarkMode((v) => !v);
    toast.info('다크 모드만 지원합니다 (라이트 모드 개발 중)');
  };

  const logout = () => {
    if (!window.confirm('정말 로그아웃 하시겠습니까? 이 기기의 데이터는 유지됩니다.')) return;
    toast.info('로그인/로그아웃 기능은 추후 지원 예정입니다');
    setModal(null);
  };

  const initials = (profile?.nickname || 'guest').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <section className="glass-card p-6 text-center relative">
        <button
          onClick={() => setEditOpen(true)}
          className="absolute top-4 right-4 flex items-center gap-1 text-[11px] font-semibold text-brand-light hover:bg-brand-soft px-2.5 py-1.5 rounded-full transition-colors"
        >
          <Pencil className="w-3 h-3" /> 편집
        </button>

        <div className="relative w-20 h-20 mx-auto mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center overflow-hidden">
            {avatarData ? (
              <img src={avatarData} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold text-white">{initials}</span>
            )}
          </div>
        </div>

        <h3 className="text-lg font-extrabold">{profile?.nickname ?? 'guest'}</h3>
        <p className="text-xs text-text-3 mt-1">{profile?.bio ?? '주식 & 코인 투자자'}</p>

        <div className="grid grid-cols-3 gap-2 mt-5">
          {STATS.map((s) => (
            <div key={s.label} className="py-3 rounded-xl bg-bg-soft">
              <p className="text-lg font-extrabold mono">{s.value}</p>
              <p className="text-[11px] text-text-3">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 보유 요약 */}
      {feed.length > 0 && (
        <section className="glass-card p-4">
          <p className="text-[11px] text-text-3 mb-2">추적 중인 자산</p>
          <div className="flex gap-2 flex-wrap">
            {feed.slice(0, 8).map((a) => (
              <span key={a.symbol} className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-soft text-brand-light">
                {a.symbol}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* 뉴스 */}
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
        </div>
        {news.length === 0 && !newsError && <NewsSkeleton rows={3} />}
      </section>

      {/* 설정 메뉴 */}
      <section className="glass-card divide-y divide-border">
        <button onClick={() => setModal('account')} className="w-full flex items-center gap-3 p-4 text-sm hover:bg-bg-soft transition-colors">
          <Settings className="w-4 h-4" />
          <span className="flex-1 text-left">계정 설정</span>
          <ChevronRight className="w-4 h-4 text-text-3" />
        </button>
        <button onClick={toggleNotif} className="w-full flex items-center gap-3 p-4 text-sm hover:bg-bg-soft transition-colors">
          <Bell className="w-4 h-4" />
          <span className="flex-1 text-left">알림 받기</span>
          <span className={cn('w-9 h-5 rounded-full p-0.5 transition-colors', notifEnabled ? 'bg-brand' : 'bg-bg-soft')}>
            <span className={cn('block w-4 h-4 rounded-full bg-white transition-transform', notifEnabled && 'translate-x-4')} />
          </span>
        </button>
        <button onClick={toggleDark} className="w-full flex items-center gap-3 p-4 text-sm hover:bg-bg-soft transition-colors">
          <Moon className="w-4 h-4" />
          <span className="flex-1 text-left">다크 모드</span>
          <span className={cn('w-9 h-5 rounded-full p-0.5 transition-colors', darkMode ? 'bg-brand' : 'bg-bg-soft')}>
            <span className={cn('block w-4 h-4 rounded-full bg-white transition-transform', darkMode && 'translate-x-4')} />
          </span>
        </button>
        <button onClick={() => setModal('help')} className="w-full flex items-center gap-3 p-4 text-sm hover:bg-bg-soft transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span className="flex-1 text-left">도움말</span>
          <ChevronRight className="w-4 h-4 text-text-3" />
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 p-4 text-sm text-down hover:bg-down/5 transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">로그아웃</span>
          <ChevronRight className="w-4 h-4 text-down/60" />
        </button>
      </section>

      {/* 편집 모달 */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="glass-card max-w-md w-full p-5 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold">프로필 편집</h3>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 rounded-full bg-bg-soft border border-border flex items-center justify-center hover:bg-bg-elev"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-5">
              <div className="relative w-24 h-24">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center overflow-hidden">
                  {avatarData ? (
                    <img src={avatarData} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-white">{initials}</span>
                  )}
                </div>
                <button
                  onClick={pickAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand border-2 border-bg-elev hover:bg-brand-dark flex items-center justify-center transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  className="hidden"
                />
              </div>
              {avatarData && (
                <button
                  onClick={() => setAvatarData('')}
                  className="mt-2 text-[11px] text-down hover:underline"
                >
                  이미지 제거
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-text-3 mb-1">닉네임</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={50}
                  className="w-full h-10 px-3 rounded-md bg-bg-soft border border-border text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-text-3 mb-1">자기소개</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={200}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md bg-bg-soft border border-border text-sm outline-none focus:border-brand resize-none"
                />
                <p className="text-[10px] text-text-3 mt-1 text-right">{bio.length}/200</p>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={loading}
              className="w-full mt-5 h-10 rounded-lg bg-brand hover:bg-brand-dark text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" /> 저장
            </button>
          </div>
        </div>
      )}

      {/* 설정 서브 모달 */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setModal(null)}
        >
          <div
            className="glass-card max-w-md w-full p-5 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold">
                {modal === 'account' && '계정 설정'}
                {modal === 'help' && '도움말'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-full bg-bg-soft border border-border flex items-center justify-center hover:bg-bg-elev"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {modal === 'account' && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-3">기기 ID</span>
                  <span className="mono text-xs">{(profile?.deviceId || '').slice(0, 12)}…</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-text-3">가입일</span>
                  <span className="text-xs">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('ko-KR') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-text-3">로그인</span>
                  <span className="text-xs text-brand-light">미지원 (게스트 모드)</span>
                </div>
                <p className="text-[11px] text-text-3 mt-3">
                  로그인/회원가입 기능은 추후 지원 예정입니다. 지금은 기기 단위로 데이터가 저장됩니다.
                </p>
              </div>
            )}

            {modal === 'help' && (
              <div className="space-y-3 text-sm">
                <p className="font-semibold">ticoin이 무엇인가요?</p>
                <p className="text-xs text-text-3">
                  주식과 코인을 한 곳에서 추적하는 실시간 대시보드입니다. CoinGecko/Binance에서 시세를 받아와 실시간으로 보여줍니다.
                </p>
                <p className="font-semibold mt-3">내 데이터는 어디에 저장되나요?</p>
                <p className="text-xs text-text-3">
                  백엔드 PostgreSQL에 기기 ID 기준으로 격리되어 저장됩니다. 브라우저 localStorage에 생성된 UUID가 식별자 역할을 합니다.
                </p>
                <p className="font-semibold mt-3">가격 알림은 어떻게 작동하나요?</p>
                <p className="text-xs text-text-3">
                  목표가를 설정하면 백엔드 스케줄러가 20초 주기로 검사하고, 도달 시 WebSocket을 통해 실시간으로 푸시합니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
