import { useState } from "react";
import { useNavigate } from "react-router";
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
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useDeleteCommunity } from "../api/deleteCommunity";
import type { Community } from "../api/types";

interface DeleteCommunityDialogProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCommunityDialog({
  community,
  open,
  onOpenChange,
}: DeleteCommunityDialogProps) {
  const [confirmSlug, setConfirmSlug] = useState("");
  const navigate = useNavigate();
  const deleteMutation = useDeleteCommunity();

  const isConfirmed =
    confirmSlug.trim().toLowerCase() === community.slug.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;

    try {
      await deleteMutation.mutateAsync(community.slug);
      toast.success(`Community "${community.name}" was permanently deleted.`);
      onOpenChange(false);
      navigate("/communities");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete community."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Community Permanently</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently remove the
            community{" "}
            <strong className="text-foreground">{community.name}</strong>, along
            with all registered study years, courses, uploaded files, and
            discussion posts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel htmlFor="confirmSlug">
              Please type{" "}
              <span className="font-mono font-bold text-foreground">
                {community.slug}
              </span>{" "}
              to confirm:
            </FieldLabel>
            <Input
              id="confirmSlug"
              placeholder={community.slug}
              value={confirmSlug}
              onChange={(e) => setConfirmSlug(e.target.value)}
              className="font-mono text-xs"
            />
            <FieldDescription>
              Type the exact slug above to enable deletion.
            </FieldDescription>
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConfirmSlug("");
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isConfirmed || deleteMutation.isPending}
            onClick={handleDelete}
            className="font-bold cursor-pointer"
          >
            {deleteMutation.isPending
              ? "Deleting..."
              : "I understand the consequences, delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
