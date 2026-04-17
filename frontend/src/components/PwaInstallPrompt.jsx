import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'ticoin.pwa.dismissed';

export default function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome !== 'dismissed') {
      setVisible(false);
      setDeferred(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[calc(100%-2rem)]">
      <div className="glass-card p-4 flex items-center gap-3 shadow-lg">
        <div className="w-10 h-10 rounded-xl gradient-brand-bg flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">ticoin 설치</p>
          <p className="text-[11px] text-text-3">홈 화면에 추가하고 앱처럼 사용하세요</p>
        </div>
        <button
          onClick={install}
          className="px-3 py-1.5 rounded-lg gradient-brand-bg text-white text-xs font-bold"
        >
          설치
        </button>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]"
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-text-3" />
        </button>
      </div>
    </div>
  );
}
