import { useState } from "react";
import { toast } from "sonner";
import { Edit2, Trash2, Check, X, MoreVertical } from "@/components/ui/icons";
import { UserAvatar } from "@/components/app/UserAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatPostDate } from "@/lib/dateUtils";
import { getErrorMessage } from "@/api/types";
import { usePermissions } from "@/hooks/usePermissions";
import { useUpdateComment } from "../api/updateComment";
import { DeleteCommentDialog } from "./DeleteCommentDialog";
import type { Comment } from "@/types/domain";

interface CommentItemProps {
  comment: Comment;
  communitySlug?: string;
  isArchived?: boolean;
}

export function CommentItem({
  comment,
  communitySlug,
  isArchived = false,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { user, canEditComment, canDeleteComment } =
    usePermissions(communitySlug);
  const updateMutation = useUpdateComment();

  const isAuthor = Boolean(
    user && comment.owner && String(user.id) === String(comment.owner.id),
  );
  const isAuthorizedToEdit = !isArchived && canEditComment(comment.owner?.id);
  const isAuthorizedToDelete =
    !isArchived && canDeleteComment(comment.owner?.id);

  const handleSaveEdit = async () => {
    const cleanContent = editContent.trim();
    if (!cleanContent) return;

    try {
      await updateMutation.mutateAsync({
        commentId: comment.id,
        postId: comment.postId,
        payload: { content: cleanContent },
      });
      setIsEditing(false);
      toast.success("Comment updated!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update comment."));
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <>
      <div className="group rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs transition-colors hover:bg-muted/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserAvatar
              username={comment.owner?.username}
              size="xs"
              className="size-6 rounded-lg text-[10px]"
              fallbackClassName="rounded-lg"
            />
            <span className="font-semibold text-foreground">
              {comment.owner?.username ?? "Anonymous"}
            </span>
            {isAuthor && (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                Author
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">
              {formatPostDate(comment.createdAt)}
            </span>

            {/* 3-Dots Dropdown Menu for Author (Edit/Delete) and Moderators (Delete Only) */}
            {!isEditing && (isAuthorizedToEdit || isAuthorizedToDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-6 text-muted-foreground hover:text-foreground cursor-pointer opacity-70 group-hover:opacity-100 transition-opacity"
                      title="Comment actions"
                    />
                  }
                >
                  <MoreVertical className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  {isAuthorizedToEdit && (
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Edit2 className="size-3.5" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                  )}
                  {isAuthorizedToDelete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2 pt-1">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              maxLength={2000}
              className="text-xs resize-none bg-background rounded-lg p-2"
              autoFocus
            />
            <div className="flex justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleCancelEdit}
                className="h-6 px-2 text-xs"
              >
                <X className="size-3 mr-1" />
                Cancel
              </Button>
              <Button
                type="button"
                size="xs"
                onClick={handleSaveEdit}
                disabled={!editContent.trim() || updateMutation.isPending}
                className="h-6 px-2 text-xs font-bold cursor-pointer"
              >
                <Check className="size-3 mr-1" />
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground pl-8 leading-relaxed whitespace-pre-line text-xs">
            {comment.content}
          </p>
        )}
      </div>

      <DeleteCommentDialog
        comment={comment}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
