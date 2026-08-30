import { KeyRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";

interface CommunityHeaderProps {
  onCreateClick?: () => void;
  onJoinClick?: () => void;
  canCreate?: boolean;
}

export function CommunityHeader({
  onCreateClick,
  onJoinClick,
  canCreate = true,
}: CommunityHeaderProps) {
  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
        Communities
      </h1>
      <div className="flex items-center justify-between gap-4">
        <AppBreadcrumb />

        <div className="flex items-center gap-2">
          {onJoinClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onJoinClick}
              className="gap-1.5 shadow-xs font-semibold shrink-0 cursor-pointer"
            >
              <KeyRound className="size-4" />
              <span className="hidden sm:inline">Join with Code</span>
              <span className="sm:hidden">Join</span>
            </Button>
          )}

          {canCreate && (
            <Button
              size="sm"
              onClick={onCreateClick}
              className="gap-1.5 shadow-xs font-semibold shrink-0 cursor-pointer"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Create New Community</span>
              <span className="sm:hidden">Create</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
