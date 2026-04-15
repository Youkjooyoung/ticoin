import { useEffect, useMemo, useState } from 'react';
import { useMarketStore } from '../stores/marketStore.js';
import { useLivePrices } from '../hooks/useLivePrices.js';
import { useBinanceTicker } from '../hooks/useBinanceTicker.js';
import StoryBar from '../components/StoryBar.jsx';
import AssetCard from '../components/AssetCard.jsx';
import AssetDetailModal from '../components/AssetDetailModal.jsx';
import AssetCardSkeleton from '../components/skeletons/AssetCardSkeleton.jsx';

export default function Home() {
  const { feed, loading, loadFeed } = useMarketStore();
  const [selected, setSelected] = useState(null);

  // 백엔드 WebSocket: 알림 이벤트 구독
  useLivePrices();

  // Binance WebSocket: 코인 실시간 tick (sub-second)
  const cryptoSymbols = useMemo(
    () => feed.filter((a) => a.type === 'CRYPTO').map((a) => a.symbol),
    [feed]
  );
  useBinanceTicker(cryptoSymbols);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  return (
    <div className="space-y-6">
      <StoryBar items={feed} />
      {loading && feed.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <AssetCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((a) => (
            <AssetCard key={a.symbol} asset={a} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected && <AssetDetailModal asset={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
