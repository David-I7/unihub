import { Skeleton } from "@/components/ui/skeleton";
import { CommunityBreadcrumb } from "@/features/communities";

export function StudyYearSkeleton() {
  return (
    <div className="min-h-full space-y-6 pb-12">
      <CommunityBreadcrumb />

      {/* Tabs & Search Skeletons */}
      <div className="space-y-6">
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />

        {/* Course Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-16 rounded-md" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
