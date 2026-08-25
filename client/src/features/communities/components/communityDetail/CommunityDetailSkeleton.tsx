import { Skeleton } from "@/components/ui/skeleton";

export function CommunityDetailSkeleton() {
  return (
    <div className="min-h-full pb-12">
      {/* Full-width Hero Banner Skeleton */}
      <div className="relative -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 px-4 py-6 sm:px-8 sm:py-8 border-b border-border bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top bar: Breadcrumb and action skeleton */}
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-28 rounded-md" />
              <Skeleton className="h-7 w-28 rounded-lg" />
            </div>
          </div>

          {/* Identity skeleton */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-9 w-1/2 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-md" />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="size-5 rounded-full" />
              <Skeleton className="h-3.5 w-32 rounded-md" />
            </div>
          </div>

          {/* 4 Stat Cards Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/50">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-card/40 p-3 space-y-1.5"
              >
                <Skeleton className="h-3 w-20 mx-auto rounded-md" />
                <Skeleton className="h-6 w-10 mx-auto rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area Container */}
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-64 rounded-xl" />

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
