import { useEffect } from 'react';
import { useMarketStore } from '../stores/marketStore.js';
import StoryBar from '../components/StoryBar.jsx';
import AssetCard from '../components/AssetCard.jsx';

export default function Home() {
  const { feed, loading, loadFeed } = useMarketStore();

  useEffect(() => { loadFeed(); }, [loadFeed]);

  return (
    <div className="space-y-6">
      <StoryBar items={feed} />
      {loading && feed.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 h-[400px] animate-pulse bg-bg-soft/40" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((a) => <AssetCard key={a.symbol} asset={a} />)}
        </div>
      )}
    </div>
  );
}
