import { Skeleton } from "@/components/ui/skeleton";
import { TeacherCardSkeleton } from "./TeacherCardSkeleton";

export function CommunityTeachersTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Unified Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex-1 min-w-[180px] max-w-md">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-36 rounded-xl" />
        </div>
      </div>

      {/* Action Button Row Placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Grid of Teacher Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {Array.from({ length: 6 }).map((_, idx) => (
          <TeacherCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

export default CommunityTeachersTabSkeleton;
