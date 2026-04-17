import { motion } from "motion/react";
import { BinanceStyleChart } from "./BinanceStyleChart";
import { LivePrice } from "./LivePrice";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from "react";

interface AssetCardProps {
  symbol: string;
  name: string;
  price: string;
  change: number;
  changeAmount: string;
  chartData: number[];
  marketCap?: string;
  volume?: string;
  likes?: number;
  comments?: number;
}

export const AssetCard = ({
  symbol,
  name,
  price,
  change,
  changeAmount,
  chartData,
  marketCap,
  volume,
  likes = 0,
  comments = 0,
}: AssetCardProps) => {
  const isPositive = change >= 0;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [timeframe, setTimeframe] = useState("1H");

  const timeframes = ["15m", "1H", "4H", "1D", "1W"];

  return (
    <div className="relative group mb-4">
      <div
        className={`absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm ${
          isPositive
            ? "bg-gradient-to-r from-[var(--gain)]/20 to-[var(--gain)]/10"
            : "bg-gradient-to-r from-[var(--loss)]/20 to-[var(--loss)]/10"
        }`}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        className="relative bg-[#0B0E11] border border-border/50 rounded-2xl overflow-hidden hover:border-border transition-all"
      >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm bg-gradient-to-br ${
              isPositive
                ? "from-[var(--gain)]/20 to-[var(--gain)]/5 text-[var(--gain)]"
                : "from-[var(--loss)]/20 to-[var(--loss)]/5 text-[var(--loss)]"
            }`}
          >
            {symbol}
          </div>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-xs text-muted-foreground">{symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <LivePrice price={price} className="font-bold text-lg" />
          <p
            className={`text-xs font-bold ${
              isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
            }`}
          >
            {isPositive ? "+" : ""}
            {changeAmount} ({isPositive ? "+" : ""}
            {change.toFixed(2)}%)
          </p>
        </div>
      </div>

      {/* Chart with Timeframe Selector */}
      <div className="relative">
        {/* Timeframe Selector */}
        <div className="absolute bottom-2 left-2 z-10 flex gap-1 bg-background/90 backdrop-blur-sm rounded-lg p-1 border border-border/30">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                timeframe === tf
                  ? "bg-gradient-to-r from-[var(--accent-gradient-start)] to-[var(--accent-gradient-end)] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="h-72 w-full">
          <BinanceStyleChart data={chartData} isPositive={isPositive} />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-3 text-xs border-b border-border/30">
        {marketCap && (
          <div>
            <p className="text-muted-foreground">시가총액</p>
            <p className="font-semibold">{marketCap}</p>
          </div>
        )}
        {volume && (
          <div>
            <p className="text-muted-foreground">거래량</p>
            <p className="font-semibold">{volume}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className="flex items-center gap-1.5"
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? "fill-red-500 text-red-500" : "text-foreground"
              }`}
            />
            <span className="text-sm font-medium">{likes + (isLiked ? 1 : 0)}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} className="flex items-center gap-1.5">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm font-medium">{comments}</span>
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }}>
            <Share2 className="w-6 h-6" />
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSaved(!isSaved)}
        >
          <Bookmark
            className={`w-6 h-6 ${
              isSaved ? "fill-foreground text-foreground" : "text-foreground"
            }`}
          />
        </motion.button>
      </div>
    </motion.div>
    </div>
  );
};
