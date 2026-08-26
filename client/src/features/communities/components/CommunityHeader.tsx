import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityBreadcrumb } from "./CommunityBreadcrumb";

interface CommunityHeaderProps {
  onCreateClick?: () => void;
}

export function CommunityHeader({ onCreateClick }: CommunityHeaderProps) {
  return (
    <div>
      <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4">
        Communities
      </h1>
      <div className="flex items-center justify-between gap-4">
        <CommunityBreadcrumb />

        <Button
          size="sm"
          onClick={onCreateClick}
          className="gap-1.5 shadow-xs font-semibold shrink-0"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">Create New Community</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>
    </div>
  );
}
