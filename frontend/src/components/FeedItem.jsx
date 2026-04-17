import { useState } from 'react';
import { Heart, MessageCircle, Share2, Hash } from 'lucide-react';
import { postApi } from '../api/social.js';
import { cn } from '../lib/utils.js';

function formatRelative(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString();
}

export default function FeedItem({ post, onUpdate }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [pending, setPending] = useState(false);

  const initials = (post.authorName || 'guest').slice(0, 2).toUpperCase();

  const onLike = async () => {
    if (pending) return;
    setPending(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => c + (nextLiked ? 1 : -1));
    try {
      await postApi.toggleLike(post.id);
      onUpdate?.({ ...post, likedByMe: nextLiked, likeCount: likeCount + (nextLiked ? 1 : -1) });
    } catch {
      setLiked(!nextLiked);
      setLikeCount((c) => c - (nextLiked ? 1 : -1));
    } finally {
      setPending(false);
    }
  };

  return (
    <article className="glass-card p-4 space-y-3 card-hover">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-brand-bg flex items-center justify-center text-sm font-bold text-white">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{post.authorName}</p>
          <p className="text-[11px] text-text-3">{formatRelative(post.createdAt)}</p>
        </div>
        {post.symbol && (
          <span className="chip">
            <Hash className="w-3 h-3" />
            {post.symbol}
          </span>
        )}
      </header>

      <p className="text-sm whitespace-pre-wrap break-words">{post.content}</p>

      {post.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-[var(--border)]">
          <img src={post.imageUrl} alt="" className="w-full max-h-96 object-cover" loading="lazy" />
        </div>
      )}

      <footer className="flex items-center gap-4 pt-2 border-t border-[var(--border)] text-xs text-text-3">
        <button
          onClick={onLike}
          disabled={pending}
          className={cn('flex items-center gap-1.5 transition-colors hover:text-down', liked && 'text-down')}
        >
          <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
          <span className="mono">{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-text-1 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="mono">{post.commentCount ?? 0}</span>
        </button>
        <button className="flex items-center gap-1.5 hover:text-text-1 transition-colors ml-auto">
          <Share2 className="w-4 h-4" />
        </button>
      </footer>
    </article>
  );
}
