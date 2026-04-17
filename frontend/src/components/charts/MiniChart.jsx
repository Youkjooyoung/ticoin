import { useId } from 'react';
import styles from './MiniChart.module.css';

export default function MiniChart({ data = [], up = true, width = 80, height = 28 }) {
  const id = useId().replace(/:/g, '');
  if (!data.length) {
    return <div className={styles.placeholder} style={{ '--w': `${width}px`, '--h': `${height}px` }} />;
  }
  const values = data.map((d) => (typeof d === 'number' ? d : d.close));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const rng = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values.map((v, i) => `${i * step},${height - ((v - min) / rng) * height}`).join(' ');
  const color = up ? '#10B981' : '#EF4444';
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`g-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points + ` ${width},${height} 0,${height}`}
        fill={`url(#g-${id})`}
        stroke="none"
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
