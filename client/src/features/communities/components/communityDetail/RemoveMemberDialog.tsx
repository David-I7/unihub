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
import { useRemoveCommunityMember } from "../../api/removeCommunityMember";
import type { CommunityMember } from "../../api/types";

interface RemoveMemberDialogProps {
  member: CommunityMember | null;
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RemoveMemberDialog({
  member,
  communitySlug,
  open,
  onOpenChange,
}: RemoveMemberDialogProps) {
  const removeMutation = useRemoveCommunityMember();

  if (!member) return null;

  const handleRemove = async () => {
    try {
      await removeMutation.mutateAsync({
        communitySlug,
        username: member.username,
      });
      toast.success(`@${member.username} was removed from the community.`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to remove member."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove{" "}
            <strong className="text-foreground">{member.username}</strong> from
            this community?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={removeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleRemove}
            disabled={removeMutation.isPending}
          >
            {removeMutation.isPending ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
