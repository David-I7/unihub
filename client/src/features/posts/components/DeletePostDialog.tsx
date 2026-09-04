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
import { useDeletePost } from "../api/deletePost";
import type { Post } from "@/types/domain";

interface DeletePostDialogProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeletePostDialog({
  post,
  open,
  onOpenChange,
  onDeleted,
}: DeletePostDialogProps) {
  const deleteMutation = useDeletePost();

  if (!post) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(post.id);
      toast.success("Post deleted successfully.");
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete post."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Discussion Post</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete{" "}
            <strong className="text-foreground">"{post.title}"</strong> and all
            its associated comments?
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
