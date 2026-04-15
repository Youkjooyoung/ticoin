import { useEffect, useRef, useState } from 'react';

export default function CandleChart({ data = [], height = 240, showVolume = true, showMA = true }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: height });

  // 부모 크기를 ResizeObserver로 추적 (초기 레이아웃 타이밍 이슈 해결)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length || size.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const W = size.w;
    const H = size.h;
    const padL = 8;
    const padR = 54;
    const padT = 12;
    const volH = showVolume ? H * 0.22 : 0;
    const chartH = H - padT - volH - 16;

    const highs = data.map((d) => d.high);
    const lows = data.map((d) => d.low);
    const maxP = Math.max(...highs);
    const minP = Math.min(...lows);
    const rng = maxP - minP || 1;
    const maxV = Math.max(...data.map((d) => d.volume || 0), 1);

    ctx.fillStyle = '#0B0B0F';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#1A1A24';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      const p = maxP - (rng / 4) * i;
      ctx.fillStyle = '#71717A';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(p.toFixed(p < 10 ? 4 : 2), W - padR + 4, y + 3);
    }

    const cw = (W - padL - padR) / data.length;
    const bw = Math.max(3, cw * 0.7);

    data.forEach((d, i) => {
      const x = padL + i * cw + cw / 2;
      const isUp = d.close >= d.open;
      const color = isUp ? '#10B981' : '#EF4444';
      const yHigh = padT + ((maxP - d.high) / rng) * chartH;
      const yLow = padT + ((maxP - d.low) / rng) * chartH;
      const yOpen = padT + ((maxP - d.open) / rng) * chartH;
      const yClose = padT + ((maxP - d.close) / rng) * chartH;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, yHigh);
      ctx.lineTo(x, yLow);
      ctx.stroke();

      const bodyTop = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillStyle = color;
      ctx.fillRect(x - bw / 2, bodyTop, bw, bodyH);
    });

    if (showMA && data.length >= 25) {
      drawMA(ctx, data, 7, '#F5A623', padL, padT, padR, chartH, cw, maxP, rng, W);
      drawMA(ctx, data, 25, '#A78BFA', padL, padT, padR, chartH, cw, maxP, rng, W);
    }

    if (showVolume) {
      const volY = padT + chartH + 10;
      data.forEach((d, i) => {
        const x = padL + i * cw + cw / 2;
        const isUp = d.close >= d.open;
        const h = ((d.volume || 0) / maxV) * (volH - 4);
        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        ctx.fillRect(x - bw / 2, volY + (volH - h - 4), bw, h);
      });
    }

    const last = data[data.length - 1];
    if (last) {
      const yLast = padT + ((maxP - last.close) / rng) * chartH;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = last.close >= last.open ? '#10B981' : '#EF4444';
      ctx.beginPath();
      ctx.moveTo(padL, yLast);
      ctx.lineTo(W - padR, yLast);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = last.close >= last.open ? '#10B981' : '#EF4444';
      ctx.fillRect(W - padR, yLast - 9, padR - 4, 18);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(last.close.toFixed(last.close < 10 ? 4 : 2), W - padR + 3, yLast + 3);
    }
  }, [data, size, showVolume, showMA]);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height }}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

function drawMA(ctx, data, period, color, padL, padT, padR, chartH, cw, maxP, rng, W) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    const avg = sum / period;
    const x = padL + i * cw + cw / 2;
    const y = padT + ((maxP - avg) / rng) * chartH;
    if (i === period - 1) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
