import { useState } from "react";
import { Search as SearchIcon, TrendingUp, Clock } from "lucide-react";
import { motion } from "motion/react";
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

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"trending" | "recent">("trending");

  const trendingSearches = [
    { term: "Bitcoin", icon: "🪙" },
    { term: "Tesla", icon: "⚡" },
    { term: "S&P 500", icon: "📈" },
    { term: "Ethereum", icon: "💎" },
    { term: "Apple", icon: "🍎" },
  ];

  const recentSearches = [
    { term: "NVIDIA", time: "2분 전" },
    { term: "Microsoft", time: "15분 전" },
    { term: "Solana", time: "1시간 전" },
    { term: "Google", time: "3시간 전" },
  ];

  const searchResults = [
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
      {/* Search Input */}
      <div className="sticky top-14 lg:top-14 z-30 bg-background/80 backdrop-blur-lg pb-4 -mx-4 px-4">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="주식, 코인 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border/50 rounded-2xl focus:outline-none focus:border-border transition-colors"
          />
        </div>
      </div>

      {searchQuery === "" ? (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/30">
            <button
              onClick={() => setActiveTab("trending")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === "trending" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              트렌딩
              {activeTab === "trending" && (
                <motion.div
                  layoutId="search-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === "recent" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Clock className="w-4 h-4" />
              최근 검색
              {activeTab === "recent" && (
                <motion.div
                  layoutId="search-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)]"
                />
              )}
            </button>
          </div>

          {/* Content */}
          {activeTab === "trending" ? (
            <div className="space-y-3">
              {trendingSearches.map((item, index) => (
                <motion.div
                  key={item.term}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-border transition-colors cursor-pointer"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium">{item.term}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 100)}K 검색
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-[var(--gain)]" />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentSearches.map((item, index) => (
                <motion.div
                  key={item.term}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-border transition-colors cursor-pointer"
                >
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{item.term}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            "{searchQuery}" 검색 결과 ({searchResults.length})
          </p>
          {searchResults.map((asset, index) => (
            <AssetCard key={`${asset.symbol}-${index}`} {...asset} />
          ))}
        </div>
      )}
    </div>
  );
};
