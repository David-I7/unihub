import { Skeleton } from "@/components/ui/skeleton";

export function CommunityPostsTabSkeleton() {
  return (
    <div className="space-y-4 w-full">
      {/* Top Action Row Placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>

      {/* Feed Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityPostsTabSkeleton;
