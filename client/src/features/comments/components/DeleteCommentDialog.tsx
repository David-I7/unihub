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
import { useDeleteComment } from "../api/deleteComment";
import type { Comment } from "@/types/domain";

interface DeleteCommentDialogProps {
  comment: Comment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCommentDialog({
  comment,
  open,
  onOpenChange,
}: DeleteCommentDialogProps) {
  const deleteMutation = useDeleteComment();

  if (!comment) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        commentId: comment.id,
        postId: comment.postId,
      });
      toast.success("Comment deleted.");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete comment."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Comment</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete this comment?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
            className="font-bold cursor-pointer"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Comment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
