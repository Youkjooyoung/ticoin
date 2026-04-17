import { motion } from "motion/react";
import { Flame, TrendingUp, TrendingDown, Eye } from "lucide-react";
import { AssetCard } from "../components/AssetCard";

const generateChartData = (baseValue: number, volatility: number) => {
  const data = [];
  let value = baseValue;
  for (let i = 0; i < 60; i++) {
    const change = (Math.random() - 0.5) * volatility;
    value = Math.max(baseValue * 0.8, Math.min(baseValue * 1.2, value + change));
    data.push(value);
  }
  return data;
};

interface TrendingItemProps {
  rank: number;
  symbol: string;
  name: string;
  change: number;
  views: string;
}

const TrendingItem = ({ rank, symbol, name, change, views }: TrendingItemProps) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-border transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-gradient-start)]/20 to-[var(--accent-gradient-end)]/20 font-bold">
        {rank}
      </div>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br ${
          isPositive
            ? "from-[var(--gain)]/20 to-[var(--gain)]/5 text-[var(--gain)]"
            : "from-[var(--loss)]/20 to-[var(--loss)]/5 text-[var(--loss)]"
        }`}
      >
        {symbol}
      </div>
      <div className="flex-1">
        <p className="font-semibold">{name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="w-3 h-3" />
          <span>{views} 조회</span>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`flex items-center gap-1 font-bold ${
            isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const Trending = () => {
  const trendingAssets = [
    { rank: 1, symbol: "SOL", name: "Solana", change: 15.67, views: "2.5M" },
    { rank: 2, symbol: "TSLA", name: "Tesla", change: 8.45, views: "1.8M" },
    { rank: 3, symbol: "BTC", name: "Bitcoin", change: 5.23, views: "3.2M" },
    { rank: 4, symbol: "NVDA", name: "NVIDIA", change: 7.89, views: "1.5M" },
    { rank: 5, symbol: "ETH", name: "Ethereum", change: 4.56, views: "2.1M" },
    { rank: 6, symbol: "AAPL", name: "Apple", change: -2.34, views: "1.3M" },
    { rank: 7, symbol: "ADA", name: "Cardano", change: 12.45, views: "890K" },
    { rank: 8, symbol: "MSFT", name: "Microsoft", change: 3.21, views: "1.1M" },
  ];

  const topMovers = [
    {
      symbol: "SOL",
      name: "Solana",
      price: "$142.34",
      change: 15.67,
      changeAmount: "$18.76",
      chartData: generateChartData(100, 12),
      marketCap: "$63.4B",
      volume: "$5.2B",
      likes: 18734,
      comments: 456,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: "$242.67",
      change: 8.45,
      changeAmount: "$18.91",
      chartData: generateChartData(100, 9),
      marketCap: "$771.2B",
      volume: "$31.8B",
      likes: 25678,
      comments: 1023,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
          <Flame className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">트렌딩</h2>
          <p className="text-sm text-muted-foreground">실시간 인기 자산</p>
        </div>
      </div>

      {/* Trending List */}
      <div className="space-y-3 mb-8">
        {trendingAssets.map((asset, index) => (
          <div key={asset.symbol} style={{ animationDelay: `${index * 50}ms` }}>
            <TrendingItem {...asset} />
          </div>
        ))}
      </div>

      {/* Top Movers Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">최고 상승률</h3>
        {topMovers.map((asset, index) => (
          <AssetCard key={`${asset.symbol}-${index}`} {...asset} />
        ))}
      </div>
    </div>
  );
};
