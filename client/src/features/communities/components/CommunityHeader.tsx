import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommunityHeaderProps {
  onCreateClick?: () => void;
}

export function CommunityHeader({ onCreateClick }: CommunityHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="size-6 text-primary" /> University Communities
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Search, join, and browse communities.
        </p>
      </div>

      <Button
        size="sm"
        onClick={onCreateClick}
        className="gap-1.5 self-start md:self-auto shadow-xs font-semibold"
      >
        <Plus className="size-4" /> Create New Community
      </Button>
    </div>
  );
}
