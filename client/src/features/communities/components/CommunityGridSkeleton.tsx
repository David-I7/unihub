import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunityGridSkeletonProps {
  count?: number;
}

export function CommunityGridSkeleton({ count = 6 }: CommunityGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden rounded-2xl border pt-0 space-y-0"
        >
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded-md" />
                <Skeleton className="h-4 w-10 rounded-md" />
              </div>
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-4/5 rounded-md" />
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
