import { useEffect, useRef } from 'react';
import { Bell, CheckCircle2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAlertStore } from '../stores/alertStore.js';
import { cn, fmtPrice } from '../lib/utils.js';

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  return `${h}시간 전`;
}

export default function NotificationDropdown({ open, onClose, onOpen }) {
  const triggered = useAlertStore((s) => s.triggered);
  const clearTriggered = useAlertStore((s) => s.clearTriggered);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open, onClose]);

  return (
    <div className="relative">
      <button
        onClick={onOpen}
        className="w-9 h-9 rounded-full bg-bg-soft border border-border flex items-center justify-center relative hover:bg-bg-elev transition-colors"
        aria-label="알림"
      >
        <Bell className="w-4 h-4" />
        {triggered.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-down animate-pulse" />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 w-80 glass-card shadow-2xl z-50 animate-[scaleIn_0.15s_ease-out] origin-top-right"
        >
          <div className="flex items-center justify-between p-3 border-b border-border">
            <p className="text-sm font-bold">알림 {triggered.length}</p>
            <div className="flex items-center gap-1">
              {triggered.length > 0 && (
                <button
                  onClick={clearTriggered}
                  className="text-[11px] text-text-3 hover:text-text-1 transition-colors px-2 py-1"
                >
                  모두 읽음
                </button>
              )}
              <button
                onClick={onClose}
                className="text-text-3 hover:text-text-1 transition-colors p-1"
                aria-label="닫기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {triggered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10">
                <Bell className="w-8 h-8 text-text-4" />
                <p className="text-xs text-text-3">새 알림이 없습니다</p>
                <Link
                  to="/alerts"
                  onClick={onClose}
                  className="mt-2 text-[11px] text-brand-light hover:underline"
                >
                  가격 알림 설정하러 가기 →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {triggered.map((evt) => (
                  <div key={evt.id} className="p-3 flex items-start gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                        'bg-brand-soft border border-brand/40'
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 text-brand-light" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold">
                        <span className="text-brand-light">{evt.symbol}</span> 목표가 도달
                      </p>
                      <p className="text-[11px] text-text-2 mono mt-0.5">
                        {evt.condition} ${fmtPrice(evt.target)} · 현재 ${fmtPrice(evt.current)}
                      </p>
                      <p className="text-[10px] text-text-3 mt-1">{timeAgo(evt.triggeredAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-border">
            <Link
              to="/alerts"
              onClick={onClose}
              className="block text-center text-xs text-brand-light hover:bg-brand-soft rounded py-2 transition-colors"
            >
              모든 알림 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
