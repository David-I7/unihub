import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3.5 p-4 rounded-2xl border border-border/60 bg-card/60"
        >
          <Skeleton className="size-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-3.5 w-4/5" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-4 w-14 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
