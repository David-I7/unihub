import { Skeleton } from "@/components/ui/skeleton";

export function CommunityHeroSkeleton() {
  return (
    <section className="relative w-full pb-2">
      {/* Top Banner Skeleton */}
      <div className="h-44 @[560px]:h-56 @[768px]:h-64 w-full rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 @[560px]:p-6 bg-muted/40 shadow-inner">
        <div className="flex items-center justify-between gap-2 z-10">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
      </div>

      {/* Main Elevated Profile Card Skeleton */}
      <div className="@container relative -mt-10 @[560px]:-mt-16 max-w-7xl mx-auto rounded-2xl border bg-card p-4 @[560px]:p-6 @[768px]:p-7 shadow-xs space-y-4 @[560px]:space-y-5">
        <div className="flex items-start justify-between gap-3 @[560px]:gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 @[560px]:gap-2">
              <Skeleton className="h-7 @[560px]:h-8 w-48 @[560px]:w-64 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
            </div>
          </div>
          <Skeleton className="size-8 @[560px]:size-9 rounded-xl shrink-0" />
        </div>

        <Skeleton className="h-4 w-3/4 max-w-2xl rounded-md" />

        {/* 4 Metric Chips Skeleton */}
        <div className="grid grid-cols-2 @[560px]:grid-cols-4 gap-2.5 @[560px]:gap-3.5 pt-2 border-t border-border/60">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 @[560px]:p-3 rounded-xl bg-muted/40 border border-border/40"
            >
              <Skeleton className="size-9 shrink-0 rounded-lg" />
              <div className="min-w-0 space-y-1.5 flex-1">
                <Skeleton className="h-2.5 w-14 rounded-md" />
                <Skeleton className="h-4 w-10 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CommunityHeroSkeleton;
