import { motion } from "motion/react";
import { Star, Plus, TrendingUp, TrendingDown, Bell, BellOff } from "lucide-react";
import { useState } from "react";
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

interface WatchlistItemProps {
  symbol: string;
  name: string;
  price: string;
  change: number;
  targetPrice?: string;
  isNotificationOn: boolean;
  onToggleNotification: () => void;
}

const WatchlistItem = ({
  symbol,
  name,
  price,
  change,
  targetPrice,
  isNotificationOn,
  onToggleNotification,
}: WatchlistItemProps) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-border transition-colors group"
    >
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
        {targetPrice && (
          <p className="text-xs text-muted-foreground">목표가: {targetPrice}</p>
        )}
      </div>
      <div className="text-right">
        <p className="font-bold">{price}</p>
        <p
          className={`text-xs font-bold ${
            isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
          }`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onToggleNotification}
        className={`p-2 rounded-lg transition-colors ${
          isNotificationOn
            ? "bg-[var(--accent-gradient-start)]/20 text-[var(--accent-gradient-start)]"
            : "text-muted-foreground hover:bg-accent"
        }`}
      >
        {isNotificationOn ? (
          <Bell className="w-5 h-5" />
        ) : (
          <BellOff className="w-5 h-5" />
        )}
      </motion.button>
    </motion.div>
  );
};

export const Watchlist = () => {
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    BTC: true,
    ETH: true,
    AAPL: false,
    TSLA: true,
    SOL: false,
  });

  const toggleNotification = (symbol: string) => {
    setNotifications((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  const watchlistItems = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$67,234.12",
      change: 3.24,
      targetPrice: "$70,000",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: "$3,456.78",
      change: 2.18,
      targetPrice: "$4,000",
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: "$178.92",
      change: -1.23,
      targetPrice: "$185",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: "$242.67",
      change: 5.67,
      targetPrice: "$300",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: "$142.34",
      change: 8.45,
    },
  ];

  const detailedAssets = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: "$67,234.12",
      change: 3.24,
      changeAmount: "$2,112.45",
      chartData: generateChartData(100, 5),
      marketCap: "$1.32T",
      volume: "$28.5B",
      likes: 12453,
      comments: 342,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: "$3,456.78",
      change: 2.18,
      changeAmount: "$73.89",
      chartData: generateChartData(100, 4),
      marketCap: "$415.6B",
      volume: "$15.2B",
      likes: 8921,
      comments: 215,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">관심목록</h2>
            <p className="text-sm text-muted-foreground">{watchlistItems.length}개 자산</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] flex items-center justify-center text-white shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-card border border-border/50 rounded-2xl"
        >
          <div className="flex items-center gap-2 text-[var(--gain)] mb-2">
            <TrendingUp className="w-4 h-4" />
            <p className="text-sm">상승 중</p>
          </div>
          <p className="text-2xl font-bold">
            {watchlistItems.filter((item) => item.change >= 0).length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-card border border-border/50 rounded-2xl"
        >
          <div className="flex items-center gap-2 text-[var(--loss)] mb-2">
            <TrendingDown className="w-4 h-4" />
            <p className="text-sm">하락 중</p>
          </div>
          <p className="text-2xl font-bold">
            {watchlistItems.filter((item) => item.change < 0).length}
          </p>
        </motion.div>
      </div>

      {/* Compact List */}
      <div className="space-y-3 mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground px-2">빠른 조회</h3>
        {watchlistItems.map((item, index) => (
          <div key={item.symbol} style={{ animationDelay: `${index * 50}ms` }}>
            <WatchlistItem
              {...item}
              isNotificationOn={notifications[item.symbol] || false}
              onToggleNotification={() => toggleNotification(item.symbol)}
            />
          </div>
        ))}
      </div>

      {/* Detailed Cards */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-4">
          상세 정보
        </h3>
        {detailedAssets.map((asset, index) => (
          <AssetCard key={`${asset.symbol}-${index}`} {...asset} />
        ))}
      </div>
    </div>
  );
};
