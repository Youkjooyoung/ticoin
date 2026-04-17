import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Settings, Pencil, Camera, Check, X, Newspaper, ExternalLink,
  TrendingUp, Award, Heart, MessageCircle,
} from 'lucide-react';
import { newsApi } from '../api/market.js';
import NewsSkeleton from '../components/skeletons/NewsSkeleton.jsx';
import { useProfileStore } from '../stores/profileStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { useMarketStore } from '../stores/marketStore.js';
import { cn } from '../lib/utils.js';
import { resizeImageToDataUrl } from '../lib/imageUtils.js';

const MOCK_STATS = [
  { icon: TrendingUp, label: '총 수익률', value: '+18.5%', color: 'bg-emerald-500/15 text-emerald-500' },
  { icon: Award,      label: '랭킹',      value: '#142',   color: 'bg-amber-500/15 text-amber-500' },
  { icon: Heart,      label: '받은 좋아요', value: '1,234', color: 'bg-rose-500/15 text-rose-500' },
  { icon: MessageCircle, label: '댓글',    value: '567',    color: 'bg-sky-500/15 text-sky-500' },
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
  const fileRef = useRef(null);

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
        if (Array.isArray(d) && d.length > 0) setNews(d.slice(0, 6));
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

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지는 5MB 이하만 가능합니다');
      e.target.value = '';
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file, { maxSize: 256, quality: 0.82 });
      setAvatarData(dataUrl);
    } catch (err) {
      toast.error('이미지 처리 실패: ' + (err?.message ?? '알 수 없는 오류'));
    } finally {
      e.target.value = '';
    }
  };

  const initials = (profile?.nickname || 'guest').slice(0, 2).toUpperCase();

  const trackedSymbols = useMemo(() => feed.slice(0, 8).map((a) => a.symbol), [feed]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Hero Card */}
      <section className="relative overflow-hidden glass-card p-6">
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgb(var(--accent-start)), rgb(var(--accent-end)))' }}
          aria-hidden
        />
        <div className="relative flex items-center gap-5">
          <div className="w-20 h-20 rounded-full gradient-brand-bg flex items-center justify-center overflow-hidden ring-4 ring-[rgb(var(--bg-elev)/0.9)] shrink-0">
            {avatarData ? (
              <img src={avatarData} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-extrabold text-white">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold truncate">{profile?.nickname ?? 'guest'}</h2>
            <p className="text-sm text-text-3 truncate mt-0.5">{profile?.bio ?? '주식 & 코인 투자자'}</p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="shrink-0 w-10 h-10 rounded-full bg-[rgb(var(--bg-elev))] border border-border hover:border-border-strong flex items-center justify-center transition-colors"
            aria-label="프로필 편집"
          >
            <Pencil className="w-4 h-4 text-text-2" />
          </button>
        </div>

        <div className="relative grid grid-cols-3 gap-3 mt-6">
          <StatCell value="1.2K" label="팔로워" />
          <StatCell value="342"  label="팔로잉" />
          <StatCell value="87"   label="포스트" />
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-3">
        {MOCK_STATS.map((s) => (
          <div key={s.label} className="glass-card p-4 card-hover">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-xl font-extrabold mono">{s.value}</p>
            <p className="text-[11px] text-text-3 mt-0.5">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Tracked Assets */}
      {trackedSymbols.length > 0 && (
        <section className="glass-card p-4">
          <p className="text-[11px] font-bold text-text-3 mb-2 uppercase tracking-wider">추적 중인 자산</p>
          <div className="flex gap-2 flex-wrap">
            {trackedSymbols.map((sym) => (
              <span key={sym} className="chip">{sym}</span>
            ))}
          </div>
        </section>
      )}

      {/* News */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            <Newspaper className="w-4 h-4 text-brand-light" /> 최신 크립토 뉴스
          </h4>
          <span className="text-[11px] text-text-3">Google News · CryptoCompare</span>
        </div>
        {newsError && (
          <div className="glass-card p-4 text-xs text-text-3">
            뉴스를 불러오지 못했습니다. 백엔드 또는 외부 API를 확인해주세요.
          </div>
        )}
        {!newsError && news.length === 0 && <NewsSkeleton rows={3} />}
        <div className="glass-card divide-y divide-border">
          {news.map((n) => (
            <NewsItem key={n.id} item={n} />
          ))}
        </div>
      </section>

      {/* Quick links */}
      <Link
        to="/settings"
        className="w-full flex items-center gap-4 p-4 glass-card card-hover text-left"
      >
        <div className="w-10 h-10 rounded-xl bg-[rgb(var(--brand-soft))] text-brand-light flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">설정</p>
          <p className="text-[11px] text-text-3">테마 · 알림 · 계정</p>
        </div>
        <span className="text-text-3">›</span>
      </Link>

      {editOpen && (
        <EditModal
          onClose={() => setEditOpen(false)}
          avatarData={avatarData}
          initials={initials}
          nickname={nickname}
          setNickname={setNickname}
          bio={bio}
          setBio={setBio}
          onPickAvatar={pickAvatar}
          onRemoveAvatar={() => setAvatarData('')}
          onSave={saveProfile}
          loading={loading}
          fileRef={fileRef}
          onFileChange={onAvatarChange}
        />
      )}
    </div>
  );
}

function StatCell({ value, label }) {
  return (
    <div className="py-3 rounded-xl bg-[rgb(var(--surface-2))] text-center">
      <p className="text-lg font-extrabold mono">{value}</p>
      <p className="text-[11px] text-text-3 mt-0.5">{label}</p>
    </div>
  );
}

function NewsItem({ item }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = item.imageUrl && !imgFailed;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      className="block p-4 hover:bg-[rgb(var(--surface-2))] transition-colors"
    >
      <div className="flex items-start gap-3">
        {showImg ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[rgb(var(--surface-2))]"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg flex-shrink-0 gradient-brand-bg opacity-80 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold line-clamp-2">{item.title}</p>
          <p className="text-[11px] text-text-3 mt-1 flex items-center gap-1">
            <span className="truncate">{item.source}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </p>
        </div>
      </div>
    </a>
  );
}

function EditModal({
  onClose, avatarData, initials, nickname, setNickname, bio, setBio,
  onPickAvatar, onRemoveAvatar, onSave, loading, fileRef, onFileChange,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      <div
        className="glass-card max-w-md w-full p-5"
        style={{ animation: 'scaleIn 0.2s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold">프로필 편집</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[rgb(var(--surface-2))] border border-border flex items-center justify-center hover:border-border-strong"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 rounded-full gradient-brand-bg flex items-center justify-center overflow-hidden">
              {avatarData ? (
                <img src={avatarData} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-white">{initials}</span>
              )}
            </div>
            <button
              onClick={onPickAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand border-2 border-[rgb(var(--bg-elev))] hover:bg-brand-dark flex items-center justify-center transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          </div>
          {avatarData && (
            <button onClick={onRemoveAvatar} className="mt-2 text-[11px] text-down hover:underline">
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
              className="w-full h-10 px-3 rounded-md bg-[rgb(var(--surface-2))] border border-border text-sm outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-text-3 mb-1">자기소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-[rgb(var(--surface-2))] border border-border text-sm outline-none focus:border-brand resize-none"
            />
            <p className="text-[10px] text-text-3 mt-1 text-right">{bio.length}/200</p>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={loading}
          className="w-full mt-5 h-10 rounded-lg gradient-brand-bg text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check className="w-4 h-4" /> 저장
        </button>
      </div>
    </div>
  );
}
