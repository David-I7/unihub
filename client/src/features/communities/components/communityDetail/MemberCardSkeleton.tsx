import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberCardSkeleton() {
  return (
    <Card className="rounded-2xl border bg-card p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="size-11 rounded-xl shrink-0" />
          <div className="space-y-1.5 min-w-0 flex-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-5 w-16 rounded-full shrink-0" />
      </div>

      <div className="pt-2.5 border-t border-border/50 flex items-center justify-between">
        <Skeleton className="h-3 w-20 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
    </Card>
  );
}
