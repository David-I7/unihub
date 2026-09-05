import { Skeleton } from "@/components/ui/skeleton";
import { CommunityHeroSkeleton } from "./CommunityHeroSkeleton";
import { CommunityStudyYearsTabSkeleton } from "./CommunityStudyYearsTabSkeleton";

export function CommunityDetailSkeleton() {
  return (
    <div className="min-h-full pb-12 space-y-3 sm:space-y-4">
      <CommunityHeroSkeleton />

      {/* Main Content Area Container */}
      <div className="max-w-7xl mx-auto space-y-6 pt-2">
        {/* Tabs Skeleton */}
        <Skeleton className="h-10 w-80 rounded-xl" />

        <CommunityStudyYearsTabSkeleton />
      </div>
    </div>
  );
}

export default CommunityDetailSkeleton;
