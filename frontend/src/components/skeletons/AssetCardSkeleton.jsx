export default function AssetCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-bg-soft" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-bg-soft rounded" />
            <div className="h-3 w-12 bg-bg-soft rounded" />
          </div>
        </div>
        <div className="space-y-2 text-right">
          <div className="h-5 w-28 bg-bg-soft rounded ml-auto" />
          <div className="h-3 w-20 bg-bg-soft rounded ml-auto" />
        </div>
      </div>
      <div className="h-2 w-full bg-bg-soft rounded mb-3" />
      <div className="h-[220px] bg-bg-soft/60 rounded-lg" />
      <div className="h-8 w-48 bg-bg-soft rounded mt-4" />
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
        <div className="h-10 bg-bg-soft rounded" />
        <div className="h-10 bg-bg-soft rounded" />
      </div>
    </div>
  );
}
