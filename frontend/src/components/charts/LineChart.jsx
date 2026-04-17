import { useId, useMemo } from 'react';
import styles from './LineChart.module.css';

export default function LineChart({
  data = [],
  labels = [],
  height = 200,
  color = '#8B5CF6',
  showGrid = true,
  showAxis = true,
}) {
  const gradId = useId().replace(/:/g, '');

  const { points, areaPoints, min, max } = useMemo(() => {
    if (!data.length) return { points: '', areaPoints: '', min: 0, max: 0 };
    const mn = Math.min(...data);
    const mx = Math.max(...data);
    const rng = mx - mn || 1;
    const w = 600;
    const h = height - 30;
    const step = w / (data.length - 1 || 1);
    const pts = data.map((v, i) => `${i * step},${h - ((v - mn) / rng) * h + 10}`).join(' ');
    const area = pts + ` ${w},${h + 10} 0,${h + 10}`;
    return { points: pts, areaPoints: area, min: mn, max: mx };
  }, [data, height]);

  if (!data.length) {
    return (
      <div className={styles.empty} style={{ '--h': `${height}px` }}>
        데이터 없음
      </div>
    );
  }

  return (
    <div className={styles.wrapper} style={{ '--h': `${height}px` }}>
      <svg viewBox={`0 0 600 ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`lg-${gradId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {showGrid && Array.from({ length: 4 }).map((_, i) => {
          const y = 10 + ((height - 30) / 4) * (i + 1);
          return <line key={i} x1="0" x2="600" y1={y} y2={y} stroke="rgb(var(--border))" strokeWidth="1" />;
        })}
        <polygon points={areaPoints} fill={`url(#lg-${gradId})`} />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      {showAxis && (
        <div className={styles.axisTop}>
          <div>{max.toFixed(2)}</div>
        </div>
      )}
      {showAxis && (
        <div className={styles.axisBottom}>
          <div>{min.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
}
