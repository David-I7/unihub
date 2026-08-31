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
import { useDeleteTeacherRating } from "../api/deleteTeacherRating";

interface DeleteReviewAlertDialogProps {
  teacherId: string;
  ratingId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteReviewAlertDialog({
  teacherId,
  ratingId,
  open,
  onOpenChange,
  onSuccess,
}: DeleteReviewAlertDialogProps) {
  const deleteMutation = useDeleteTeacherRating(teacherId);

  if (ratingId === null) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(ratingId);
      toast.success("Review deleted successfully.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete review."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this review?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="font-bold cursor-pointer"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
