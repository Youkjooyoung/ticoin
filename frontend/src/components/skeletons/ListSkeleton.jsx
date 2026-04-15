export default function ListSkeleton({ rows = 5 }) {
  return (
    <div className="glass-card divide-y divide-border animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-bg-soft" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-32 bg-bg-soft rounded" />
            <div className="h-3 w-20 bg-bg-soft rounded" />
          </div>
          <div className="w-14 h-6 bg-bg-soft rounded" />
          <div className="w-20 space-y-2">
            <div className="h-3.5 w-full bg-bg-soft rounded" />
            <div className="h-3 w-12 bg-bg-soft rounded ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}
