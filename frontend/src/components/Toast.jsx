import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '../stores/toastStore.js';
import { cn } from '../lib/utils.js';

const ICON = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLE = {
  success: 'border-up/50 bg-up/10 text-up',
  error: 'border-down/50 bg-down/10 text-down',
  info: 'border-brand/50 bg-brand-soft text-brand-light',
};

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = ICON[t.type] ?? Info;
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md min-w-[260px] max-w-[400px] shadow-lg animate-[slideIn_0.25s_ease-out]',
              STYLE[t.type] ?? STYLE.info
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
