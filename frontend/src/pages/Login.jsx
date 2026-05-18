import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Shield, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { cn } from '../lib/utils.js';

const PROVIDER_STYLES = {
  google: {
    className: 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50',
    icon: <GoogleIcon />,
  },
  kakao: {
    className: 'bg-[#FEE500] text-[#3C1E1E] border-[#FEE500] hover:brightness-95',
    icon: <KakaoIcon />,
  },
};

export default function Login() {
  const { t } = useTranslation();
  const { providers, loadProviders, loginWith } = useAuthStore();

  useEffect(() => { loadProviders(); }, [loadProviders]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl gradient-brand-bg flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold gradient-text">{t('app.name')}</h1>
          <p className="text-sm text-text-3 mt-1">{t('app.tagline')}</p>
        </div>

        <div className="space-y-2 pt-2">
          {providers.map((provider) => {
            const style = PROVIDER_STYLES[provider.id] || { className: 'bg-brand text-white', icon: <LogIn className="w-5 h-5" /> };
            return (
              <button
                key={provider.id}
                disabled={!provider.enabled}
                onClick={() => loginWith(provider.loginUrl)}
                className={cn('w-full h-12 rounded-lg border flex items-center justify-center gap-3 font-semibold transition-all', style.className, !provider.enabled && 'opacity-60 cursor-not-allowed')}
              >
                {style.icon}
                <span>{provider.label}{!provider.enabled && ' (설정 필요)'}</span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-text-3 flex items-center justify-center gap-1.5 mb-3">
            <Shield className="w-3 h-3" /> 로그인하지 않아도 게스트 모드로 사용할 수 있습니다.
          </p>
          <Link to="/" className="inline-block text-sm text-brand-light font-semibold hover:underline">
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.815 1.875 5.29 4.688 6.688l-1.188 4.313c-.094.406.375.75.719.5L11.25 19.5c.25.022.5.033.75.033 5.523 0 10-3.477 10-7.733S17.523 3 12 3z"/>
    </svg>
  );
}
