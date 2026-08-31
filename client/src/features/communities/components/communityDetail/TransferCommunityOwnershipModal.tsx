import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useUpdateCommunity } from "../../api/updateCommunity";
import type { Community } from "../../api/types";

interface TransferCommunityOwnershipModalProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferCommunityOwnershipModal({
  community,
  open,
  onOpenChange,
}: TransferCommunityOwnershipModalProps) {
  const [newOwnerUsername, setNewOwnerUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateCommunity();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewOwnerUsername("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = newOwnerUsername.trim();

    if (!targetUsername) {
      setError("Please enter the username of the new owner.");
      return;
    }

    if (
      targetUsername.toLowerCase() === community.owner?.username?.toLowerCase()
    ) {
      setError("You are already the owner of this community.");
      return;
    }

    setError(null);
    try {
      await updateMutation.mutateAsync({
        communitySlug: community.slug,
        payload: {
          newOwnerUsername: targetUsername,
        },
      });

      toast.success(
        `Ownership of "${community.name}" successfully transferred to @${targetUsername}.`,
      );
      handleOpenChange(false);
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Failed to transfer community ownership.",
      );
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-heading">
            Transfer Community Ownership
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Designate a new primary owner for{" "}
            <strong className="text-foreground">{community.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Action Overview Callout */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Important Consequences</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed text-[11px]">
            <li>
              Full ownership and primary administrative privileges will transfer
              immediately.
            </li>
            <li>
              You will become an administrator and will no longer control
              ownership settings.
            </li>
            <li>
              This action cannot be undone unless the new owner transfers it
              back.
            </li>
          </ul>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4 pt-1">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="transferNewOwner">
              New Owner Username
            </FieldLabel>
            <Input
              id="transferNewOwner"
              placeholder="e.g. alex_smith"
              value={newOwnerUsername}
              onChange={(e) => setNewOwnerUsername(e.target.value)}
              className="text-xs"
              autoFocus
            />
            <FieldDescription>
              The user must already be an active member of this community.
            </FieldDescription>
            <FieldError errors={error ? [{ message: error }] : []} />
          </Field>

          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={updateMutation.isPending || !newOwnerUsername.trim()}
              className="w-full sm:w-auto text-xs h-9 cursor-pointer font-semibold gap-1.5"
            >
              <span>
                {updateMutation.isPending
                  ? "Transferring..."
                  : "Confirm Transfer"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
