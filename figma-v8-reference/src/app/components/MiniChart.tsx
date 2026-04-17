import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MiniChartProps {
  data: number[];
  isPositive: boolean;
}

export const MiniChart = ({ data, isPositive }: MiniChartProps) => {
  const chartData = data.map((value, index) => ({ value, index }));
  const gradientId = `gradient-${isPositive ? "up" : "down"}-${Math.random().toString(36).substr(2, 9)}`;

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <div className="w-full h-full min-h-[192px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={192}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "var(--gain)" : "var(--loss)"}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
