import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LineChart, Lock, Mail, ShieldCheck, User, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { cn } from '../lib/utils.js';

const AUTH_FEATURES = [
  { title: '실시간 관심종목', text: 'Binance USDT 마켓과 Yahoo 주식 데이터를 계정에 연결합니다.' },
  { title: '포트폴리오와 가격 알림', text: '보유 자산, 관심목록, 알림을 로그인 상태로 이어서 사용합니다.' },
  { title: 'OpenAI 시장 분석', text: '관심 자산 기준으로 분석 결과와 피드를 확인합니다.' },
];

const PROVIDER_META = {
  google: {
    label: 'Google로 계속하기',
    className: 'bg-white text-[#3c4043] border-[#dadce0] hover:bg-[#f8fafd]',
    logo: <GoogleLogo />,
  },
  kakao: {
    label: '카카오 로그인',
    className: 'bg-[#FEE500] text-[#000000] border-[#FEE500] hover:brightness-[0.98]',
    logo: <KakaoLogo />,
  },
};

export default function Login() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { providers, loadProviders, loginWith, login, register, loading } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { loadProviders(); }, [loadProviders]);

  const socialProviders = providers.filter((provider) => provider.id !== 'local');

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'register') {
        await register(form);
        toast.success('회원가입이 완료되었습니다.');
      } else {
        await login(form);
        toast.success('로그인되었습니다.');
      }
      navigate('/profile');
    } catch (error) {
      toast.error(error?.response?.data?.message ?? '로그인 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text-1 px-5 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-8 lg:min-h-[calc(100vh-5rem)] lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-bg-elev p-6 shadow-2xl shadow-black/20 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-cyan-300 to-up" />
          <Link to="/" className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-soft px-3 text-sm font-semibold text-text-2 hover:text-text-1">
            <ArrowLeft className="h-4 w-4" />
            홈으로
          </Link>

          <div className="mt-10 max-w-xl">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand-light">
              <LineChart className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-light">Ticoin account</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-4xl">
              로그인하고 시장 데이터와 내 투자 흐름을 하나로 관리하세요.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-text-3">
              계정으로 접속하면 관심목록, 포트폴리오, 가격 알림, 프로필 정보가 같은 흐름 안에서 유지됩니다.
            </p>
          </div>

          <div className="mt-10 grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {AUTH_FEATURES.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-bg-soft p-4">
                <p className="text-sm font-extrabold">{item.title}</p>
                <p className="mt-2 text-xs leading-5 text-text-3">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-bg-elev p-5 shadow-2xl shadow-black/20 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold">{mode === 'login' ? '로그인' : '회원가입'}</h2>
            <p className="mt-1 text-sm text-text-3">
              {mode === 'login' ? '계정으로 포트폴리오와 관심목록을 이어서 사용하세요.' : '이메일 계정으로 Ticoin을 시작하세요.'}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-bg-soft p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn('h-10 rounded-lg text-sm font-bold transition-colors', mode === 'login' ? 'bg-brand text-white' : 'text-text-3 hover:text-text-1')}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn('h-10 rounded-lg text-sm font-bold transition-colors', mode === 'register' ? 'bg-brand text-white' : 'text-text-3 hover:text-text-1')}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <Field label="이름">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                  <input
                    value={form.name}
                    onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                    className="input pl-10"
                    placeholder="표시할 이름"
                    maxLength={100}
                  />
                </div>
              </Field>
            )}

            <Field label="이메일">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </Field>

            <Field label="비밀번호">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                  className="input px-10"
                  placeholder="8자 이상"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1"
                  aria-label="비밀번호 표시 전환"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand text-sm font-extrabold text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
              {mode === 'login' ? <ShieldCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-text-3">또는</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            {socialProviders.map((provider) => (
              <SocialButton key={provider.id} provider={provider} onClick={() => loginWith(provider.loginUrl)} />
            ))}
            {socialProviders.some((provider) => !provider.enabled) && (
              <p className="pt-1 text-center text-xs text-text-3">소셜 로그인은 제공자 설정이 완료되면 활성화됩니다.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-text-3">{label}</span>
      {children}
    </label>
  );
}

function SocialButton({ provider, onClick }) {
  const meta = PROVIDER_META[provider.id] ?? {
    label: `${provider.label}로 계속하기`,
    className: 'bg-bg-soft text-text-1 border-border hover:bg-bg-elev',
    logo: null,
  };

  return (
    <button
      type="button"
      disabled={!provider.enabled}
      onClick={onClick}
      className={cn(
        'relative flex h-12 w-full items-center justify-center rounded-md border px-4 text-[15px] font-bold transition-all disabled:cursor-not-allowed',
        meta.className,
      )}
    >
      <span className="absolute left-4 flex h-5 w-5 items-center justify-center">{meta.logo}</span>
      {meta.label}
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 18 18" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

function KakaoLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#000000" d="M12 3.2c-5.28 0-9.56 3.33-9.56 7.44 0 2.65 1.78 4.98 4.46 6.3l-.72 2.64c-.1.38.33.68.64.44l3.14-2.1c.66.1 1.34.16 2.04.16 5.28 0 9.56-3.33 9.56-7.44S17.28 3.2 12 3.2Z" />
    </svg>
  );
}
