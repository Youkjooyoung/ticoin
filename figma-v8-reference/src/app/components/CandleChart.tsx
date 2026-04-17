import { useEffect, useRef } from "react";

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandleChartProps {
  data: number[];
  isPositive: boolean;
}

const generateCandleData = (prices: number[]): CandleData[] => {
  const candles: CandleData[] = [];
  const candleCount = 25;
  const step = Math.max(1, Math.floor(prices.length / candleCount));

  for (let i = 0; i < candleCount; i++) {
    const startIdx = i * step;
    const endIdx = Math.min(startIdx + step, prices.length);
    const slice = prices.slice(startIdx, endIdx);

    if (slice.length > 0) {
      const open = slice[0];
      const close = slice[slice.length - 1];
      const high = Math.max(...slice);
      const low = Math.min(...slice);

      candles.push({ open, high, low, close });
    }
  }

  return candles;
};

export const CandleChart = ({ data, isPositive }: CandleChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const candles = generateCandleData(data);
    if (candles.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const allValues = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allValues);
    const maxPrice = Math.max(...allValues);
    const priceRange = maxPrice - minPrice || 1;

    const candleWidth = Math.max(2, chartWidth / candles.length - 2);
    const spacing = chartWidth / candles.length;

    ctx.clearRect(0, 0, width, height);

    candles.forEach((candle, i) => {
      const isUp = candle.close >= candle.open;
      const color = isUp ? "#FF3B30" : "#0A84FF";

      const x = padding + i * spacing + spacing / 2;
      const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight;
      const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight;

      const bodyTop = Math.min(openY, closeY);
      const bodyBottom = Math.max(openY, closeY);
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      if (isUp) {
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }
    });
  }, [data]);

  return (
    <div className="w-full h-full min-h-[192px]">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
