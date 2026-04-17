import { useState } from 'react';
import { Send, Hash, Image as ImageIcon, X } from 'lucide-react';
import { postApi } from '../api/social.js';
import { useProfileStore } from '../stores/profileStore.js';
import { useToastStore } from '../stores/toastStore.js';
import { resizeImageToDataUrl } from '../lib/imageUtils.js';
import { cn } from '../lib/utils.js';

export default function PostComposer({ onPosted }) {
  const { profile } = useProfileStore();
  const toast = useToastStore();
  const [content, setContent] = useState('');
  const [symbol, setSymbol] = useState('');
  const [imageData, setImageData] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initials = (profile?.nickname || 'guest').slice(0, 2).toUpperCase();
  const remaining = 1000 - content.length;

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지는 5MB 이하만 가능합니다');
      e.target.value = '';
      return;
    }
    try {
      const dataUrl = await resizeImageToDataUrl(file, { maxSize: 512, quality: 0.8 });
      setImageData(dataUrl);
    } catch (err) {
      toast.error('이미지 처리 실패');
    } finally {
      e.target.value = '';
    }
  };

  const submit = async () => {
    if (!content.trim()) {
      toast.error('내용을 입력해주세요');
      return;
    }
    setSubmitting(true);
    try {
      const post = await postApi.create({
        content: content.trim(),
        symbol: symbol.trim() || null,
        imageUrl: imageData || null,
      });
      toast.success('게시글이 등록되었습니다');
      setContent('');
      setSymbol('');
      setImageData('');
      onPosted?.(post);
    } catch (err) {
      toast.error('등록 실패: ' + (err?.response?.data?.message ?? err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full gradient-brand-bg flex items-center justify-center text-sm font-bold text-white shrink-0">
          {initials}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="생각이나 시장 분석을 공유해 보세요…"
          className="flex-1 bg-transparent text-sm outline-none resize-none placeholder:text-text-3"
        />
      </div>

      {imageData && (
        <div className="relative rounded-xl overflow-hidden border border-[var(--border)]">
          <img src={imageData} alt="preview" className="w-full max-h-64 object-cover" />
          <button
            onClick={() => setImageData('')}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
        <label className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs cursor-pointer hover:bg-[rgb(var(--border)/0.5)] transition-colors">
          <Hash className="w-3 h-3" />
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase().slice(0, 20))}
            placeholder="심볼"
            className="bg-transparent outline-none w-14 text-xs mono"
          />
        </label>
        <label className="p-2 rounded-lg hover:bg-[var(--surface-2)] cursor-pointer transition-colors">
          <ImageIcon className="w-4 h-4 text-text-2" />
          <input type="file" accept="image/*" className="hidden" onChange={onImage} />
        </label>
        <span className={cn('ml-auto text-[11px] mono', remaining < 50 ? 'text-down' : 'text-text-3')}>
          {remaining}
        </span>
        <button
          onClick={submit}
          disabled={submitting || !content.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-brand-bg text-white text-xs font-bold disabled:opacity-50 hover:opacity-90"
        >
          <Send className="w-3 h-3" />
          <span>게시</span>
        </button>
      </div>
    </div>
  );
}
