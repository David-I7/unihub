import { Skeleton } from "@/components/ui/skeleton";

export function CommunityStudyYearsTabSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top Action Button Placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

      {/* Grid of Study Year Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <Skeleton className="size-11 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-md" />
                  <Skeleton className="h-3 w-36 rounded-md" />
                </div>
              </div>
              <Skeleton className="size-6 rounded-md shrink-0" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border/60">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommunityStudyYearsTabSkeleton;
