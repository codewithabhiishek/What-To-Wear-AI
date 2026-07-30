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
    <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Moodboard placeholder — matches the 3/4 aspect ratio */}
      <div className="skeleton w-full rounded-none" style={{ aspectRatio: "3/4" }} />
      <div className="space-y-3 p-4">
        {/* Item chips row */}
        <div className="flex gap-1.5">
          <div className="skeleton h-5 w-20 rounded-full" />
          <div className="skeleton h-5 w-16 rounded-full" />
        </div>
        {/* Explanation text */}
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-3/4 rounded-full" />
        {/* Button row */}
        <div className="flex justify-end pt-1">
          <div className="skeleton h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function OutfitListSkeleton({ count = 3 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <OutfitCardSkeleton key={i} />
      ))}
    </div>
  );
}
