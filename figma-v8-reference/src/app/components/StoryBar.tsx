import { motion } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StoryItemProps {
  symbol: string;
  name: string;
  price: string;
  change: number;
}

const StoryItem = ({ symbol, name, price, change }: StoryItemProps) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
    >
      <div className="relative">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br ${
            isPositive
              ? "from-[var(--gain)]/20 to-[var(--gain)]/5 text-[var(--gain)]"
              : "from-[var(--loss)]/20 to-[var(--loss)]/5 text-[var(--loss)]"
          } border-2 ${
            isPositive ? "border-[var(--gain)]" : "border-[var(--loss)]"
          }`}
        >
          {symbol}
        </div>
        <div
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
            isPositive ? "bg-[var(--gain)]" : "bg-[var(--loss)]"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-black" />
          ) : (
            <TrendingDown className="w-3 h-3 text-black" />
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{name}</p>
        <p
          className={`text-[10px] font-bold ${
            isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
          }`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}%
        </p>
      </div>
    </motion.div>
  );
};

export const StoryBar = () => {
  const watchlist = [
    { symbol: "BTC", name: "Bitcoin", price: "$67,234", change: 3.24 },
    { symbol: "ETH", name: "Ethereum", price: "$3,456", change: 2.18 },
    { symbol: "AAPL", name: "Apple", price: "$178", change: -1.23 },
    { symbol: "TSLA", name: "Tesla", price: "$242", change: 5.67 },
    { symbol: "SOL", name: "Solana", price: "$142", change: 8.45 },
    { symbol: "NVDA", name: "NVIDIA", price: "$892", change: 4.32 },
    { symbol: "ADA", name: "Cardano", price: "$0.62", change: -2.14 },
    { symbol: "MSFT", name: "Microsoft", price: "$412", change: 1.89 },
  ];

  return (
    <div className="relative overflow-hidden border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex gap-6 overflow-x-auto scrollbar-hide px-4 py-4">
        {watchlist.map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StoryItem {...item} />
          </motion.div>
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
