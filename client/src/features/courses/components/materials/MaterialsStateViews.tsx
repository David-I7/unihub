import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function MaterialsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function MaterialsErrorAlert({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
      <p className="text-sm font-semibold text-destructive">
        Failed to load course materials.
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}

export function MaterialsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-4">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <FolderOpen className="size-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Folder is Empty
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          No files, links, or subfolders have been added to this location yet.
        </p>
      </div>
    </div>
  );
}
