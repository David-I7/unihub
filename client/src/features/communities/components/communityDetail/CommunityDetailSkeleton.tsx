import { Skeleton } from "@/components/ui/skeleton";

export function CommunityDetailSkeleton() {
  return (
    <div className="min-h-full pb-12 space-y-3 sm:space-y-4">
      {/* Top Banner Skeleton */}
      <div className="relative h-24 sm:h-32 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 sm:px-8 pt-3 sm:pt-6 rounded-b-2xl sm:rounded-b-3xl bg-muted/40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
      </div>

      {/* Main Elevated Profile Card Skeleton */}
      <div className="@container relative -mt-10 @[560px]:-mt-16 max-w-7xl mx-auto rounded-2xl border bg-card p-4 @[560px]:p-6 @[768px]:p-7 shadow-xs space-y-4 @[560px]:space-y-5">
        <div className="flex items-start justify-between gap-3 @[560px]:gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 @[560px]:gap-2">
              <Skeleton className="h-7 @[560px]:h-8 w-44 @[560px]:w-64 rounded-md" />
              <Skeleton className="h-5 w-16 @[560px]:w-20 rounded-md" />
              <Skeleton className="h-5 w-20 @[560px]:w-24 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
            </div>
          </div>
          <Skeleton className="size-8 @[560px]:size-8.5 rounded-xl shrink-0" />
        </div>

        <Skeleton className="h-4 w-3/4 max-w-2xl rounded-md" />

        {/* 4 Metric Chips Skeleton: 2 cols below 560px, 4 cols >= 560px */}
        <div className="grid grid-cols-2 @[560px]:grid-cols-4 gap-2 @[560px]:gap-2.5 pt-2.5 @[560px]:pt-3.5 border-t border-border/60">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg @[560px]:rounded-xl border border-border/70 bg-muted/20 py-2 px-2.5 @[560px]:p-3.5 flex flex-col items-center justify-center text-center space-y-1 @[560px]:space-y-1.5 shadow-2xs"
            >
              <Skeleton className="h-3 @[560px]:h-3.5 w-20 @[560px]:w-24 rounded-md" />
              <Skeleton className="h-5 @[560px]:h-6 w-8 @[560px]:w-10 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area Container */}
      <div className="max-w-7xl mx-auto space-y-6 pt-2">
        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-80 rounded-xl" />

        {/* Content Skeleton Grid matching StudyYearCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="size-11 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-3 w-32 rounded-md" />
                  </div>
                </div>
                <Skeleton className="size-6 rounded-md" />
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
