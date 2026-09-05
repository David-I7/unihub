import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/api/types";
import { useLeaveCommunity } from "../../api/leaveCommunity";
import type { Community } from "../../api/types";

interface LeaveCommunityDialogProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveCommunityDialog({
  community,
  open,
  onOpenChange,
}: LeaveCommunityDialogProps) {
  const leaveMutation = useLeaveCommunity();

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync(community.slug);
      toast.success(`You have left "${community.name}".`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to leave community."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Leave Community</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave{" "}
            <strong className="text-foreground">{community.name}</strong>? You
            will need an invitation code to rejoin if this community is private.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={leaveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
          >
            {leaveMutation.isPending ? "Leaving..." : "Leave Community"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
