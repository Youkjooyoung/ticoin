import { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import api from '../api/axios.js';
import { useToastStore } from '../stores/toastStore.js';
import { useProfileStore } from '../stores/profileStore.js';
import { cn } from '../lib/utils.js';

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function CommentPanel({ symbol, open }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const toastError = useToastStore((s) => s.error);
  const toastSuccess = useToastStore((s) => s.success);
  const profile = useProfileStore((s) => s.profile);

  useEffect(() => {
    if (!open || !symbol) return;
    setLoading(true);
    api
      .get('/comments', { params: { symbol } })
      .then((r) => setComments(r.data || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [open, symbol]);

  const submit = async () => {
    const content = text.trim();
    if (!content) return;
    try {
      const res = await api.post('/comments', {
        symbol,
        author: profile?.nickname || 'guest',
        content,
      });
      setComments((prev) => [res.data, ...prev]);
      setText('');
    } catch (err) {
      toastError('댓글 등록 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
      toastSuccess('댓글 삭제됨');
    } catch (err) {
      toastError('삭제 실패: ' + (err?.response?.data?.message ?? err.message));
    }
  };

  if (!open) return null;

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex gap-2 mb-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={`${symbol} 토론에 의견을 남기세요...`}
          maxLength={500}
          className="flex-1 h-9 px-3 rounded-md bg-bg-soft border border-border text-xs outline-none focus:border-brand"
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="w-9 h-9 rounded-md bg-brand hover:bg-brand-dark disabled:opacity-40 flex items-center justify-center text-white transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <p className="text-center text-xs text-text-3 py-4">로딩 중...</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-text-3 py-4">첫 번째 의견을 남겨보세요</p>
      ) : (
        <div className="space-y-2 max-h-[260px] overflow-y-auto">
          {comments.map((c) => {
            const mine = profile?.nickname === c.author;
            return (
              <div
                key={c.id}
                className={cn(
                  'flex items-start gap-2 p-2.5 rounded-lg',
                  mine ? 'bg-brand-soft border border-brand/30' : 'bg-bg-soft'
                )}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center text-[10px] font-bold shrink-0">
                  {c.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold">{c.author}</p>
                    <p className="text-[10px] text-text-3">{timeAgo(c.createdAt)}</p>
                  </div>
                  <p className="text-xs text-text-2 mt-0.5 break-words">{c.content}</p>
                </div>
                {mine && (
                  <button
                    onClick={() => remove(c.id)}
                    className="shrink-0 text-text-3 hover:text-down transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
