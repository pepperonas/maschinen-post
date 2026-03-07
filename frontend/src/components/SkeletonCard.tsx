export function SkeletonCard() {
  return (
    <div className="dark:bg-machine-surface bg-white border dark:border-machine-border border-gray-200 rounded-sm p-5">
      {/* Source + category */}
      <div className="flex items-center gap-2 mb-3">
        <div className="skeleton-shimmer h-4 w-20 rounded-sm" />
        <div className="skeleton-shimmer h-4 w-16 rounded-sm" />
      </div>

      {/* Title */}
      <div className="skeleton-shimmer h-5 w-full rounded-sm mb-2" />
      <div className="skeleton-shimmer h-5 w-3/4 rounded-sm mb-4" />

      {/* Summary */}
      <div className="skeleton-shimmer h-4 w-full rounded-sm mb-1.5" />
      <div className="skeleton-shimmer h-4 w-full rounded-sm mb-1.5" />
      <div className="skeleton-shimmer h-4 w-2/3 rounded-sm mb-4" />

      {/* Tags */}
      <div className="flex gap-2 mb-3">
        <div className="skeleton-shimmer h-5 w-12 rounded-sm" />
        <div className="skeleton-shimmer h-5 w-16 rounded-sm" />
        <div className="skeleton-shimmer h-5 w-10 rounded-sm" />
      </div>

      {/* Footer */}
      <div className="flex justify-between">
        <div className="skeleton-shimmer h-3 w-20 rounded-sm" />
        <div className="skeleton-shimmer h-3 w-24 rounded-sm" />
      </div>
    </div>
  )
}
