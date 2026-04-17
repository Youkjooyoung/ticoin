export function readThemeColors() {
  if (typeof document === 'undefined') {
    return {
      bg: '#0B0B0F',
      bgElev: '#13131A',
      surface2: '#1A1A24',
      border: '#23232E',
      text1: '#F5F5F7',
      text3: '#71717A',
      up: '#10B981',
      down: '#EF4444',
    };
  }
  const root = getComputedStyle(document.documentElement);
  const rgb = (name, fallback) => {
    const raw = root.getPropertyValue(name).trim();
    if (!raw) return fallback;
    return `rgb(${raw})`;
  };
  const rgba = (name, alpha, fallback) => {
    const raw = root.getPropertyValue(name).trim();
    if (!raw) return fallback;
    return `rgb(${raw} / ${alpha})`;
  };
  return {
    bg: rgb('--bg', '#0B0B0F'),
    bgElev: rgb('--bg-elev', '#13131A'),
    surface2: rgb('--surface-2', '#1A1A24'),
    border: rgb('--border', '#23232E'),
    text1: rgb('--text-1', '#F5F5F7'),
    text3: rgb('--text-3', '#71717A'),
    up: rgb('--up', '#10B981'),
    down: rgb('--down', '#EF4444'),
    upSoft: rgba('--up', 0.5, 'rgba(16,185,129,0.5)'),
    downSoft: rgba('--down', 0.5, 'rgba(239,68,68,0.5)'),
  };
}
