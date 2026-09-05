import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CommunityReadmeTabSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Top Action Button Placeholder */}
      <div className="flex justify-end">
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Main Markdown Readme Content Skeleton */}
      <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-4">
        <Skeleton className="h-7 w-56 rounded-md" />

        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-11/12 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
        </div>

        <div className="h-px bg-border/40 my-3" />

        <Skeleton className="h-5 w-40 rounded-md" />

        <div className="space-y-2 pt-1">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded-md" />
        </div>
      </Card>
    </div>
  );
}

export default CommunityReadmeTabSkeleton;
