export default function NewsSkeleton({ rows = 4 }) {
  return (
    <div className="glass-card divide-y divide-border animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-3">
          <div className="w-14 h-14 rounded-lg bg-bg-soft shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-full bg-bg-soft rounded" />
            <div className="h-3.5 w-3/4 bg-bg-soft rounded" />
            <div className="h-2.5 w-24 bg-bg-soft rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
