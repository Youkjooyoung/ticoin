import { StoryBar } from "../components/StoryBar";
import { AssetCard } from "../components/AssetCard";

// Mock data generator for charts
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

export const Home = () => {
  const assets = [
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
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: "$178.92",
      change: -1.23,
      changeAmount: "-$2.23",
      chartData: generateChartData(100, 3),
      marketCap: "$2.79T",
      volume: "$52.1B",
      likes: 15678,
      comments: 567,
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: "$242.67",
      change: 5.67,
      changeAmount: "$13.04",
      chartData: generateChartData(100, 8),
      marketCap: "$771.2B",
      volume: "$23.8B",
      likes: 23456,
      comments: 891,
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: "$142.34",
      change: 8.45,
      changeAmount: "$11.08",
      chartData: generateChartData(100, 10),
      marketCap: "$63.4B",
      volume: "$3.2B",
      likes: 6734,
      comments: 123,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      price: "$892.45",
      change: 4.32,
      changeAmount: "$36.98",
      chartData: generateChartData(100, 6),
      marketCap: "$2.21T",
      volume: "$41.5B",
      likes: 19234,
      comments: 634,
    },
  ];

  return (
    <>
      <StoryBar />
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 lg:pb-8">
        {assets.map((asset, index) => (
          <AssetCard key={`${asset.symbol}-${index}`} {...asset} />
        ))}
      </div>
    </>
  );
};
