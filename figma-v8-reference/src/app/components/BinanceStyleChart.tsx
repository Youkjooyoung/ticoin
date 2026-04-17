import { useEffect, useRef, useState } from "react";

interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface BinanceStyleChartProps {
  data: number[];
  isPositive: boolean;
}

const generateCandleData = (prices: number[]): CandleData[] => {
  const candles: CandleData[] = [];
  const candleCount = 30; // Reduced from 50 to 30 for wider candles
  const step = Math.max(1, Math.floor(prices.length / candleCount));
  const now = Date.now();

  for (let i = 0; i < candleCount; i++) {
    const startIdx = i * step;
    const endIdx = Math.min(startIdx + step, prices.length);
    const slice = prices.slice(startIdx, endIdx);

    if (slice.length > 0) {
      const open = slice[0];
      const close = slice[slice.length - 1];
      const high = Math.max(...slice);
      const low = Math.min(...slice);
      const isUp = close >= open;
      const volume = (Math.random() * 0.5 + 0.5) * (isUp ? 1.2 : 0.8) * 1000000;

      candles.push({
        timestamp: now - (candleCount - i) * 3600000,
        open,
        high,
        low,
        close,
        volume,
      });
    }
  }

  return candles;
};

const formatPrice = (price: number): string => {
  if (price >= 1000) {
    return price.toFixed(2);
  } else if (price >= 1) {
    return price.toFixed(3);
  } else {
    return price.toFixed(5);
  }
};

const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(2) + "M";
  } else if (volume >= 1000) {
    return (volume / 1000).toFixed(2) + "K";
  }
  return volume.toFixed(0);
};

export const BinanceStyleChart = ({ data, isPositive }: BinanceStyleChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const candleData = generateCandleData(data);
    if (candleData.length === 0) return;
    setCandles(candleData);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    const chartAreaHeight = height * 0.7;
    const volumeAreaHeight = height * 0.25;
    const volumeAreaTop = chartAreaHeight + 5;
    const padding = { top: 10, right: 60, bottom: 30, left: 10 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = chartAreaHeight - padding.top;
    const volumeHeight = volumeAreaHeight;

    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;
    const priceBuffer = priceRange * 0.1;

    const maxVolume = Math.max(...candleData.map(c => c.volume));

    const candleWidth = Math.max(6, (chartWidth / candleData.length) * 0.85); // Increased from 0.7 to 0.85
    const spacing = chartWidth / candleData.length;
    const wickWidth = Math.max(1, candleWidth * 0.15); // Wick is thinner than body

    // Background
    ctx.fillStyle = "transparent";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#1E2329";
    ctx.lineWidth = 1;

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice + priceBuffer - ((maxPrice + priceBuffer - (minPrice - priceBuffer)) / gridLines) * i;
      ctx.fillStyle = "#848E9C";
      ctx.font = "10px Inter";
      ctx.textAlign = "left";
      ctx.fillText(formatPrice(price), width - padding.right + 5, y + 4);
    }

    // Vertical grid lines
    const timeGridLines = 6;
    for (let i = 0; i <= timeGridLines; i++) {
      const x = padding.left + (chartWidth / timeGridLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, chartAreaHeight);
      ctx.stroke();
    }

    // Calculate moving averages
    const ma7: number[] = [];
    const ma25: number[] = [];

    for (let i = 0; i < candleData.length; i++) {
      // MA7
      if (i >= 6) {
        const sum = candleData.slice(i - 6, i + 1).reduce((acc, c) => acc + c.close, 0);
        ma7.push(sum / 7);
      } else {
        ma7.push(candleData[i].close);
      }

      // MA25
      if (i >= 24) {
        const sum = candleData.slice(i - 24, i + 1).reduce((acc, c) => acc + c.close, 0);
        ma25.push(sum / 25);
      } else {
        ma25.push(candleData[i].close);
      }
    }

    // Draw moving averages
    const drawMA = (values: number[], color: string, lineWidth: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      values.forEach((value, i) => {
        const x = padding.left + i * spacing + spacing / 2;
        const y = padding.top + ((maxPrice + priceBuffer - value) / (priceRange + priceBuffer * 2)) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    };

    drawMA(ma7, "#F0B90B", 1.5);
    drawMA(ma25, "#E056FD", 1.5);

    // Draw candles
    candleData.forEach((candle, i) => {
      const isUp = candle.close >= candle.open;
      const color = isUp ? "#0ECB81" : "#F6465D";

      const x = padding.left + i * spacing + spacing / 2;
      const highY = padding.top + ((maxPrice + priceBuffer - candle.high) / (priceRange + priceBuffer * 2)) * chartHeight;
      const lowY = padding.top + ((maxPrice + priceBuffer - candle.low) / (priceRange + priceBuffer * 2)) * chartHeight;
      const openY = padding.top + ((maxPrice + priceBuffer - candle.open) / (priceRange + priceBuffer * 2)) * chartHeight;
      const closeY = padding.top + ((maxPrice + priceBuffer - candle.close) / (priceRange + priceBuffer * 2)) * chartHeight;

      const bodyTop = Math.min(openY, closeY);
      const bodyBottom = Math.max(openY, closeY);
      const bodyHeight = Math.max(2, bodyBottom - bodyTop); // Minimum height increased to 2

      // Wick (shadow line)
      ctx.strokeStyle = color;
      ctx.lineWidth = wickWidth;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      ctx.fillStyle = color;
      if (isUp) {
        // Green candle - filled
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      } else {
        // Red candle - filled
        ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      }

      // Volume bars
      const volumeBarHeight = (candle.volume / maxVolume) * volumeHeight;
      const volumeY = volumeAreaTop + volumeHeight - volumeBarHeight;

      ctx.globalAlpha = 0.6;
      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, volumeY, candleWidth, volumeBarHeight);
      ctx.globalAlpha = 1;
    });

    // Volume area separator
    ctx.strokeStyle = "#1E2329";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, volumeAreaTop);
    ctx.lineTo(width - padding.right, volumeAreaTop);
    ctx.stroke();

    // Volume label
    ctx.fillStyle = "#848E9C";
    ctx.font = "10px Inter";
    ctx.textAlign = "left";
    ctx.fillText("Volume", padding.left + 5, volumeAreaTop + 15);

    // Current price indicator
    const lastCandle = candleData[candleData.length - 1];
    if (lastCandle) {
      const lastPrice = lastCandle.close;
      const lastPriceY = padding.top + ((maxPrice + priceBuffer - lastPrice) / (priceRange + priceBuffer * 2)) * chartHeight;

      ctx.strokeStyle = isPositive ? "#0ECB81" : "#F6465D";
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding.left, lastPriceY);
      ctx.lineTo(width - padding.right, lastPriceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price tag
      ctx.fillStyle = isPositive ? "#0ECB81" : "#F6465D";
      const priceText = formatPrice(lastPrice);
      const textWidth = ctx.measureText(priceText).width;
      ctx.fillRect(width - padding.right, lastPriceY - 10, textWidth + 10, 20);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "11px Inter";
      ctx.textAlign = "left";
      ctx.fillText(priceText, width - padding.right + 5, lastPriceY + 4);
    }

  }, [data, isPositive]);

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];

  // Calculate MA values for display
  let ma7Value = 0;
  let ma25Value = 0;

  if (candles.length >= 7) {
    const sum7 = candles.slice(-7).reduce((acc, c) => acc + c.close, 0);
    ma7Value = sum7 / 7;
  }

  if (candles.length >= 25) {
    const sum25 = candles.slice(-25).reduce((acc, c) => acc + c.close, 0);
    ma25Value = sum25 / 25;
  }

  return (
    <div className="w-full h-full min-h-[192px] relative">
      {/* MA Info - Top Left */}
      {lastCandle && (
        <div className="absolute top-2 left-2 z-10 flex gap-4 text-xs bg-background/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/30">
          <div className="flex items-center gap-1.5">
            <span className="text-[#F0B90B]">MA7:</span>
            <span className="text-foreground font-medium">{formatPrice(ma7Value)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#E056FD]">MA25:</span>
            <span className="text-foreground font-medium">{formatPrice(ma25Value)}</span>
          </div>
        </div>
      )}

      {/* OHLC Info - Top Right */}
      {lastCandle && (
        <div className="absolute top-2 right-2 z-10 text-xs space-y-0.5 bg-background/60 backdrop-blur-sm rounded-lg p-2 border border-border/30">
          <div className="flex gap-3">
            <span className="text-muted-foreground">O:</span>
            <span className="text-foreground">{formatPrice(lastCandle.open)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground">H:</span>
            <span className="text-[#0ECB81]">{formatPrice(lastCandle.high)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground">L:</span>
            <span className="text-[#F6465D]">{formatPrice(lastCandle.low)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground">C:</span>
            <span className="text-foreground">{formatPrice(lastCandle.close)}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-muted-foreground">Vol:</span>
            <span className="text-foreground">{formatVolume(lastCandle.volume)}</span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
