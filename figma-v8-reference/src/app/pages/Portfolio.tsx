import { motion } from "motion/react";
import { TrendingUp, TrendingDown, PieChart, DollarSign, ArrowUpRight } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Pie, PieChart as RePieChart } from "recharts";

const generatePortfolioData = () => {
  const data = [];
  let value = 100000;
  for (let i = 0; i < 30; i++) {
    value += (Math.random() - 0.4) * 2000;
    data.push({ day: i, value });
  }
  return data;
};

interface HoldingCardProps {
  symbol: string;
  name: string;
  amount: string;
  value: string;
  change: number;
  percentage: number;
}

const HoldingCard = ({ symbol, name, amount, value, change, percentage }: HoldingCardProps) => {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-card border border-border/50 rounded-2xl hover:border-border transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
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
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">{amount}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold">{value}</p>
          <p
            className={`text-xs font-bold ${
              isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`h-full ${
              isPositive ? "bg-[var(--gain)]" : "bg-[var(--loss)]"
            }`}
          />
        </div>
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      </div>
    </motion.div>
  );
};

export const Portfolio = () => {
  const portfolioData = generatePortfolioData();
  const totalValue = portfolioData[portfolioData.length - 1].value;
  const initialValue = portfolioData[0].value;
  const totalChange = ((totalValue - initialValue) / initialValue) * 100;
  const isPositive = totalChange >= 0;

  const holdings = [
    { symbol: "BTC", name: "Bitcoin", amount: "0.5 BTC", value: "$33,617", change: 3.24, percentage: 35 },
    { symbol: "ETH", name: "Ethereum", amount: "5 ETH", value: "$17,284", change: 2.18, percentage: 25 },
    { symbol: "AAPL", name: "Apple", amount: "100주", value: "$17,892", change: -1.23, percentage: 20 },
    { symbol: "TSLA", name: "Tesla", amount: "50주", value: "$12,134", change: 5.67, percentage: 15 },
    { symbol: "SOL", name: "Solana", amount: "30 SOL", value: "$4,270", change: 8.45, percentage: 5 },
  ];

  const pieData = holdings.map((h, index) => ({
    id: `${h.symbol}-${index}`,
    name: `${h.symbol}-${index}`, // Make name unique
    symbol: h.symbol, // Keep original symbol for display
    value: h.percentage,
    color: h.change >= 0 ? "#00FFA3" : "#FF006E",
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 lg:pb-8">
      {/* Total Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 rounded-3xl mb-6"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent-gradient-start)]/10 to-[var(--accent-gradient-end)]/10 rounded-full blur-3xl" />

        <div className="relative">
          <p className="text-sm text-muted-foreground mb-2">총 자산 가치</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-4xl font-bold">
              ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </h2>
            <div
              className={`flex items-center gap-1 font-bold mb-1 ${
                isPositive ? "text-[var(--gain)]" : "text-[var(--loss)]"
              }`}
            >
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>
                {isPositive ? "+" : ""}
                {totalChange.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Portfolio Chart */}
          <div className="h-32 w-full -mx-2">
            <ResponsiveContainer width="100%" height="100%" minHeight={128}>
              <AreaChart data={portfolioData}>
                <defs>
                  <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "var(--gain)" : "var(--loss)"}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "var(--gain)" : "var(--loss)"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={["dataMin - 5000", "dataMax + 5000"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => [`$${value.toFixed(0)}`, "가치"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? "var(--gain)" : "var(--loss)"}
                  strokeWidth={2}
                  fill="url(#portfolioGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-card border border-border/50 rounded-2xl"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="w-4 h-4" />
            <p className="text-sm">일일 수익</p>
          </div>
          <p className="text-xl font-bold text-[var(--gain)]">+$2,345</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 bg-card border border-border/50 rounded-2xl"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ArrowUpRight className="w-4 h-4" />
            <p className="text-sm">총 수익률</p>
          </div>
          <p className="text-xl font-bold text-[var(--gain)]">+18.5%</p>
        </motion.div>
      </div>

      {/* Asset Allocation */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          자산 배분
        </h3>
        <div className="p-6 bg-card border border-border/50 rounded-2xl">
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minHeight={192}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${entry.id}-${index}`} fill={entry.color} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const displayName = props.payload.symbol || name;
                    return [`${value}%`, displayName];
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div>
        <h3 className="text-lg font-bold mb-4">보유 자산</h3>
        <div className="space-y-3">
          {holdings.map((holding, index) => (
            <div key={holding.symbol} style={{ animationDelay: `${index * 50}ms` }}>
              <HoldingCard {...holding} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
