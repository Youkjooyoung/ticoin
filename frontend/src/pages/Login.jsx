import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, Shield, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { cn } from '../lib/utils.js';

const PROVIDER_STYLES = {
  google: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
  kakao: 'bg-[#FEE500] text-[#3C1E1E] border-[#FEE500] hover:brightness-95',
};

export default function Login() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { providers, loadProviders, loginWith, login, register, loading } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => { loadProviders(); }, [loadProviders]);

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
    <div className="min-h-screen grid lg:grid-cols-[1fr_480px] bg-bg text-text-1">
      <section className="hidden lg:flex flex-col justify-between p-10 border-r border-border bg-[rgb(var(--surface-1))]">
        <div>
          <Link to="/" className="text-xl font-extrabold">Ticoin</Link>
          <p className="mt-3 text-sm text-text-3 max-w-md">Binance USDT 실시간 코인 시세와 Yahoo 주식 데이터를 한 화면에서 관리합니다.</p>
        </div>
        <div className="grid gap-3 max-w-md">
          {['실시간 관심종목 관리', '포트폴리오와 가격 알림', 'OpenAI 기반 시장 분석'].map((item) => (
            <div key={item} className="glass-card p-4 text-sm font-semibold">{item}</div>
          ))}
        </div>
      </section>

      <main className="flex items-center justify-center p-5">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold">{mode === 'login' ? '로그인' : '회원가입'}</h1>
            <p className="text-sm text-text-3 mt-1">계정으로 포트폴리오, 관심목록, 프로필을 이어서 사용하세요.</p>
          </div>

          <form onSubmit={submit} className="glass-card p-5 space-y-4">
            {mode === 'register' && (
              <Field label="이름">
                <input
                  value={form.name}
                  onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                  className="input"
                  placeholder="표시할 이름"
                  maxLength={100}
                />
              </Field>
            )}
            <Field label="이메일">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-3" />
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
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))}
                  className="input pr-10"
                  placeholder="8자 이상"
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3" aria-label="비밀번호 보기 전환">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <button disabled={loading} className="w-full h-11 rounded-lg bg-brand text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {mode === 'login' ? '로그인' : '회원가입'}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full text-sm text-brand-light font-semibold"
            >
              {mode === 'login' ? '계정이 없나요? 회원가입' : '이미 계정이 있나요? 로그인'}
            </button>
          </form>

          <div className="glass-card p-5 space-y-3">
            <p className="text-xs text-text-3 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> 소셜 로그인은 설정된 제공자만 활성화됩니다.
            </p>
            {providers.filter((provider) => provider.id !== 'local').map((provider) => (
              <button
                key={provider.id}
                disabled={!provider.enabled}
                onClick={() => loginWith(provider.loginUrl)}
                className={cn('w-full h-10 rounded-lg border font-semibold transition-all', PROVIDER_STYLES[provider.id] ?? 'bg-bg-elev border-border', !provider.enabled && 'opacity-60 cursor-not-allowed')}
              >
                {provider.label}{!provider.enabled && ' 설정 필요'}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-text-3 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
