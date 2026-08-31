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
import { useDeleteMaterial } from "../../api/deleteMaterial";
import type { CourseMaterialFile, CourseMaterialLink } from "../../api/types";

interface DeleteMaterialDialogProps {
  material:
    | { type: "file"; data: CourseMaterialFile }
    | { type: "link"; data: CourseMaterialLink }
    | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteMaterialDialog({
  material,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMaterialDialogProps) {
  const deleteMutation = useDeleteMaterial();
  const [error, setError] = useState<string | null>(null);

  if (!material) return null;

  const isFile = material.type === "file";
  const itemTypeLabel = isFile ? "file" : "resource link";

  const handleDelete = async () => {
    try {
      setError(null);
      await deleteMutation.mutateAsync({ materialId: material.data.id });
      toast.success(
        `${isFile ? "File" : "Link"} "${material.data.title}" deleted successfully.`,
      );
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = getErrorMessage(err, `Failed to delete ${itemTypeLabel}.`);
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
          <DialogTitle>
            Delete {isFile ? "File" : "Link"} "{material.data.title}"
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-1 text-xs">
            <span className="block text-foreground/80">
              Are you sure you want to permanently delete this {itemTypeLabel}?
              {isFile && " The associated file storage will also be deleted."}
            </span>
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
            type="submit"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            className="gap-1.5 font-bold cursor-pointer"
          >
            <Trash2 className="size-4" />
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
