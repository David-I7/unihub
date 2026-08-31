import { useState } from "react";
import { toast } from "sonner";
import { Trash2, AlertTriangle } from "@/components/ui/icons";
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
import { useDeleteFolder } from "../../api/deleteFolder";
import type { CourseMaterialFolder } from "../../api/types";

interface DeleteFolderDialogProps {
  folder: CourseMaterialFolder | null;
  isModerator: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteFolderDialog({
  folder,
  isModerator,
  open,
  onOpenChange,
  onSuccess,
}: DeleteFolderDialogProps) {
  const deleteMutation = useDeleteFolder();
  const [error, setError] = useState<string | null>(null);

  if (!folder) return null;

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteMutation.mutateAsync({ folderId: folder.id });
      toast.success(`Folder "${folder.name}" deleted successfully.`);
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to delete folder.");
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-2">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle>Delete Folder "{folder.name}"</DialogTitle>
          <DialogDescription className="space-y-2 pt-1 text-xs">
            {isModerator ? (
              <span className="block font-medium text-destructive">
                Warning: As a moderator, deleting this folder will permanently remove all nested subfolders, files, and links inside it.
              </span>
            ) : (
              <span className="block text-foreground/80">
                You can only delete this folder if it is empty. If it contains files or subfolders, you will need to delete or move them first.
              </span>
            )}
            <span className="block text-muted-foreground">
              This action cannot be undone.
            </span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            className="gap-1.5 font-bold cursor-pointer"
          >
            <Trash2 className="size-4" />
            {deleteMutation.isPending ? "Deleting..." : "Delete Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
