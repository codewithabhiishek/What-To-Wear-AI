// Shimmer skeleton placeholders used across loading states.
// The `.skeleton` class (shimmer gradient + animation) is defined globally in index.css.

export function ClosetItemSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="skeleton aspect-[3/4] w-full rounded-none" />
      <div className="space-y-2 p-3">
        <div className="skeleton h-3 w-1/3 rounded-full" />
        <div className="skeleton h-3 w-1/2 rounded-full" />
        <div className="flex gap-1">
          <div className="skeleton h-4 w-12 rounded-full" />
          <div className="skeleton h-4 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ClosetGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ClosetItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function OutfitCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex gap-2">
        <div className="skeleton h-20 w-20 rounded-lg" />
        <div className="skeleton h-20 w-20 rounded-lg" />
        <div className="skeleton h-20 w-20 rounded-lg" />
      </div>
      <div className="skeleton h-4 w-3/4 rounded-full" />
      <div className="flex justify-end">
        <div className="skeleton h-8 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function OutfitListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OutfitCardSkeleton key={i} />
      ))}
    </div>
  );
}
