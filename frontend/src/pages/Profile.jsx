import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Check, LogOut, Mail, Pencil, Settings, User } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useProfileStore } from '../stores/profileStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { useMarketStore } from '../stores/marketStore.js';
import { resizeImageToDataUrl } from '../lib/imageUtils.js';

export default function Profile() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { user, token, loadMe, logout } = useAuthStore();
  const { profile, loading, load, update } = useProfileStore();
  const { feed, loadFeed } = useMarketStore();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [avatarData, setAvatarData] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    loadMe();
    load();
    loadFeed();
  }, [loadMe, load, loadFeed]);

  useEffect(() => {
    const displayName = profile?.nickname || user?.name || user?.email?.split('@')[0] || '';
    setNickname(displayName);
    setBio(profile?.bio || '');
    setAvatarData(profile?.avatarUrl || user?.avatarUrl || '');
  }, [profile, user]);

  const initials = useMemo(() => {
    const base = nickname || user?.name || user?.email || 'user';
    return base.slice(0, 2).toUpperCase();
  }, [nickname, user]);

  const trackedSymbols = useMemo(() => feed.filter((asset) => asset.type === 'CRYPTO').slice(0, 12), [feed]);

  const saveProfile = async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해 주세요.');
      return;
    }
    try {
      await update({ nickname: nickname.trim(), bio: bio.trim(), avatarUrl: avatarData || null });
      toast.success('프로필이 저장되었습니다.');
      setEditing(false);
    } catch (error) {
      toast.error(error?.response?.data?.message ?? '프로필 저장 중 오류가 발생했습니다.');
    }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지는 5MB 이하로 업로드해 주세요.');
      e.target.value = '';
      return;
    }
    try {
      setAvatarData(await resizeImageToDataUrl(file, { maxSize: 256, quality: 0.82 }));
      setEditing(true);
    } catch {
      toast.error('이미지를 처리하지 못했습니다.');
    } finally {
      e.target.value = '';
    }
  };

  const onLogout = () => {
    logout();
    toast.success('로그아웃되었습니다.');
    navigate('/login');
  };

  if (!token || !user) {
    return (
      <div className="max-w-xl mx-auto glass-card p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl gradient-brand-bg mx-auto flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold">로그인이 필요합니다</h2>
          <p className="text-sm text-text-3 mt-1">계정으로 로그인하면 프로필, 포트폴리오, 관심목록을 이어서 사용할 수 있습니다.</p>
        </div>
        <Link to="/login" className="inline-flex h-10 px-4 rounded-lg bg-brand text-white font-bold items-center justify-center">
          로그인 / 회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <section className="glass-card p-6">
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full gradient-brand-bg flex items-center justify-center overflow-hidden">
              {avatarData ? <img src={avatarData} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl font-extrabold text-white">{initials}</span>}
            </div>
            <button onClick={() => fileRef.current?.click()} className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-brand border border-border flex items-center justify-center" aria-label="프로필 이미지 변경">
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onAvatarChange} className="hidden" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={50} className="input text-lg font-bold" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={200} rows={3} className="input h-auto py-2 resize-none" placeholder="투자 스타일이나 관심 분야를 입력하세요." />
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-extrabold truncate">{nickname}</h2>
                <p className="text-sm text-text-3 mt-1">{bio || '소개가 아직 없습니다.'}</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3 text-xs text-text-3">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
              <span>·</span>
              <span>{user.provider === 'local' ? '이메일 계정' : user.provider}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <button onClick={saveProfile} disabled={loading} className="icon-btn text-brand-light" aria-label="프로필 저장">
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setEditing(true)} className="icon-btn" aria-label="프로필 편집">
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <button onClick={onLogout} className="icon-btn text-down" aria-label="로그아웃">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <Metric label="관심 코인" value={`${trackedSymbols.length}`} />
        <Metric label="계정 유형" value={user.provider === 'local' ? 'Email' : user.provider} />
        <Metric label="역할" value={user.role || 'USER'} />
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold">실시간 추적 중인 Binance USDT 마켓</h3>
          <Link to="/settings" className="text-text-3 hover:text-text-1" aria-label="설정">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          {trackedSymbols.map((asset) => (
            <span key={asset.symbol} className="chip">{asset.symbol}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-text-3">{label}</p>
      <p className="text-xl font-extrabold mono mt-2">{value}</p>
    </div>
  );
}
