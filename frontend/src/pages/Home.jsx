import { useEffect, useState } from 'react';
import { useMarketStore } from '../stores/marketStore.js';
import { useLivePrices } from '../hooks/useLivePrices.js';
import { useProfileStore } from '../stores/profileStore.js';
import StoryBar from '../components/StoryBar.jsx';
import AssetCard from '../components/AssetCard.jsx';
import AssetDetailModal from '../components/AssetDetailModal.jsx';
import AssetCardSkeleton from '../components/skeletons/AssetCardSkeleton.jsx';
import PostComposer from '../components/PostComposer.jsx';
import FeedItem from '../components/FeedItem.jsx';
import AiAnalysisCard from '../components/AiAnalysisCard.jsx';
import { postApi } from '../api/social.js';

export default function Home() {
  const { feed, loading, loadFeed } = useMarketStore();
  const { load: loadProfile } = useProfileStore();
  const [selected, setSelected] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useLivePrices();

  useEffect(() => { loadFeed(); loadProfile(); }, [loadFeed, loadProfile]);

  useEffect(() => {
    setPostsLoading(true);
    postApi.list({ page: 0, size: 10 })
      .then((list) => setPosts(Array.isArray(list) ? list : []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, []);

  const onPosted = (created) => setPosts((list) => [created, ...list]);
  const topAsset = feed[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6 min-w-0">
        <StoryBar items={feed} />

        {loading && feed.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <AssetCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {feed.map((asset) => (
              <AssetCard key={asset.symbol} asset={asset} onOpen={setSelected} />
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-4">
        {topAsset && (
          <AiAnalysisCard
            symbol={topAsset.symbol}
            price={topAsset.price}
            changePct={topAsset.changePercent24h}
          />
        )}

        <PostComposer onPosted={onPosted} />

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-text-3 uppercase tracking-wider px-1">커뮤니티 피드</h3>
          {postsLoading && <div className="glass-card p-4 text-sm text-text-3">게시글을 불러오는 중입니다.</div>}
          {!postsLoading && posts.length === 0 && <div className="glass-card p-4 text-sm text-text-3">아직 게시글이 없습니다.</div>}
          {posts.map((post) => (
            <FeedItem
              key={post.id}
              post={post}
              onUpdate={(updated) => setPosts((list) => list.map((item) => item.id === updated.id ? updated : item))}
            />
          ))}
        </section>
      </aside>

      {selected && <AssetDetailModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
