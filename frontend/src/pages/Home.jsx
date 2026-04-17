import { useEffect, useMemo, useState } from 'react';
import { useMarketStore } from '../stores/marketStore.js';
import { useLivePrices } from '../hooks/useLivePrices.js';
import { useBinanceTicker } from '../hooks/useBinanceTicker.js';
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

  const cryptoSymbols = useMemo(
    () => feed.filter((a) => a.type === 'CRYPTO').map((a) => a.symbol),
    [feed]
  );
  useBinanceTicker(cryptoSymbols);

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
    <div className="space-y-6">
      <StoryBar items={feed} />

      {topAsset && (
        <AiAnalysisCard
          symbol={topAsset.symbol}
          price={topAsset.price}
          changePct={topAsset.changePct}
        />
      )}

      <PostComposer onPosted={onPosted} />

      {loading && feed.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <AssetCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {feed.slice(0, 3).map((a) => (
            <AssetCard key={a.symbol} asset={a} onOpen={setSelected} />
          ))}
        </div>
      )}

      {posts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-text-3 uppercase tracking-wider px-1">커뮤니티 피드</h3>
          {posts.map((p) => (
            <FeedItem key={p.id} post={p} onUpdate={(u) => setPosts((list) => list.map((x) => x.id === u.id ? u : x))} />
          ))}
        </section>
      )}

      {feed.length > 3 && (
        <div className="space-y-4">
          {feed.slice(3).map((a) => (
            <AssetCard key={a.symbol} asset={a} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected && <AssetDetailModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
