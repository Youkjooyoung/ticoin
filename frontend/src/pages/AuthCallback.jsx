import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore.js';
import { useToastStore } from '../stores/toastStore.js';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setToken, loadMe } = useAuthStore();
  const toast = useToastStore();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    const provider = params.get('provider');

    if (error) {
      toast.error('로그인 실패: ' + error);
      navigate('/login', { replace: true });
      return;
    }

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    setToken(token);
    loadMe().then(() => {
      toast.success(`${provider ?? '소셜'} 로그인 성공`);
      navigate('/', { replace: true });
    });
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <p className="text-sm text-text-3">로그인 처리 중…</p>
      </div>
    </div>
  );
}
