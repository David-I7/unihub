import { Skeleton } from "@/components/ui/skeleton";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";

export function CourseSkeleton() {
  return (
    <div className="min-h-full space-y-6 pb-12">
      <AppBreadcrumb />

      {/* Tabs Header Skeleton */}
      <Skeleton className="h-10 w-full max-w-2xl rounded-xl" />

      {/* Content Skeleton */}
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
