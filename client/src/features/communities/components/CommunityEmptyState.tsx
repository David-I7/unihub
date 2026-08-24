import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityEmptyStateProps {
  searchQuery?: string;
  onClear?: () => void;
}

export function CommunityEmptyState({
  searchQuery,
  onClear,
}: CommunityEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center space-y-3">
      <div className="rounded-full bg-muted p-3 text-muted-foreground">
        <SearchX className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="font-heading text-base font-bold text-foreground">
          No communities found
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {searchQuery
            ? `We couldn't find any community matching "${searchQuery}". Try checking for typos or searching by a different name.`
            : "There are no communities available at the moment."}
        </p>
      </div>
      {searchQuery && onClear && (
        <Button variant="outline" size="sm" onClick={onClear} className="text-xs font-semibold">
          Clear Search Filter
        </Button>
      )}
    </div>
  );
}
