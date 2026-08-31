import { MoreVertical, Edit2, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface MaterialItemActionsProps {
  canEdit: boolean;
  canDelete: boolean;
  canMoveUp?: boolean;
  onEdit: () => void;
  onMoveUp?: () => void;
  onDelete: () => void;
  className?: string;
}

export function MaterialItemActions({
  canEdit,
  canDelete,
  canMoveUp = false,
  onEdit,
  onMoveUp,
  onDelete,
  className = "",
}: MaterialItemActionsProps) {
  if (!canEdit && !canDelete && !canMoveUp) {
    return null;
  }

  return (
    <div
      className={className}
      onClick={(e) => {
        // Prevent clicking the card/row when clicking actions trigger
        e.stopPropagation();
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="size-7 p-0 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              title="More actions"
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-44">
          {canEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <Edit2 className="size-3.5" />
              <span>Edit Details</span>
            </DropdownMenuItem>
          )}

          {canMoveUp && onMoveUp && canEdit && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="cursor-pointer gap-2 text-xs"
            >
              <ArrowUp className="size-3.5 text-primary" />
              <span>Move Up One Level</span>
            </DropdownMenuItem>
          )}

          {(canEdit || canMoveUp) && canDelete && <DropdownMenuSeparator />}

          {canDelete && (
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="cursor-pointer gap-2 text-xs text-destructive"
            >
              <Trash2 className="size-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
