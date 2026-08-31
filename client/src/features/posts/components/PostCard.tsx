import { useState, useMemo } from "react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import {
  Heart,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit2,
  Trash2,
} from "@/components/ui/icons";
import { Pin, PinOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatPostDate } from "@/lib/dateUtils";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useTogglePostLike } from "../api/toggleLike";
import { usePinPost } from "../api/pinPost";
import { useInfinitePostComments } from "@/features/comments/api/getPostComments";
import { CommentComposer } from "@/features/comments/components/CommentComposer";
import { CommentItem } from "@/features/comments/components/CommentItem";
import { EditPostModal } from "./EditPostModal";
import { DeletePostDialog } from "./DeletePostDialog";
import type { Post } from "@/types/domain";

export interface PostCardProps {
  post: Post;
  communitySlug?: string;
  className?: string;
}

export function PostCard({ post, communitySlug, className }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(Boolean(post.isLiked));
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { canPinPost, canEditPost, canDeletePost } =
    usePermissions(communitySlug);

  const likeMutation = useTogglePostLike();
  const pinMutation = usePinPost();

  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfinitePostComments(post.id, { size: 20 }, { enabled: commentsOpen });

  const fetchedComments = useMemo(() => {
    return commentsData?.pages.flatMap((p) => p.content) ?? [];
  }, [commentsData]);

  const isPostAuthor = Boolean(
    user && post.owner && String(user.id) === String(post.owner.id),
  );
  const canEdit = canEditPost(post.owner?.id);
  const canDelete = canDeletePost(post.owner?.id);
  const hasActions = canPinPost || canEdit || canDelete;

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts.");
      return;
    }

    const previousLiked = isLiked;
    const previousLikes = likes;
    const nextLiked = !previousLiked;
    const nextLikes = nextLiked
      ? previousLikes + 1
      : Math.max(0, previousLikes - 1);

    setIsLiked(nextLiked);
    setLikes(nextLikes);

    try {
      await likeMutation.mutateAsync({
        postId: post.id,
        isLiked: previousLiked,
      });
    } catch {
      setIsLiked(previousLiked);
      setLikes(previousLikes);
      toast.error("Failed to update like status.");
    }
  };

  const handleTogglePin = async () => {
    try {
      await pinMutation.mutateAsync({
        postId: post.id,
        pinned: !post.pinned,
      });
      toast.success(post.pinned ? "Post unpinned." : "Post pinned to top!");
    } catch {
      toast.error("Failed to update pin status.");
    }
  };

  const totalComments = post.commentsCount ?? 0;

  return (
    <>
      <Card
        className={cn(
          "group rounded-2xl border bg-card p-5 shadow-xs transition-all space-y-0",
          post.pinned && "border-primary/40 bg-primary/[0.02]",
          className,
        )}
      >
        {/* Header: Author info, badges, and actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <UserAvatar username={post.owner?.username} size="default" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {post.owner?.username ?? "Anonymous"}
                </span>
                {isPostAuthor && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                    Author
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatPostDate(post.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {post.pinned && (
              <Badge
                variant="verified"
                size="xs"
                className="font-semibold gap-1"
              >
                <Pin className="size-3 fill-primary/30" />
                Pinned
              </Badge>
            )}

            {hasActions && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Post actions"
                    />
                  }
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40">
                  {canPinPost && (
                    <DropdownMenuItem
                      onClick={handleTogglePin}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      {post.pinned ? (
                        <>
                          <PinOff className="size-3.5" />
                          Unpin Post
                        </>
                      ) : (
                        <>
                          <Pin className="size-3.5" />
                          Pin to Top
                        </>
                      )}
                    </DropdownMenuItem>
                  )}

                  {canEdit && (
                    <DropdownMenuItem
                      onClick={() => setEditModalOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Edit2 className="size-3.5" />
                      Edit Post
                    </DropdownMenuItem>
                  )}

                  {(canPinPost || canEdit) && canDelete && (
                    <DropdownMenuSeparator />
                  )}

                  {canDelete && (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      <Trash2 className="size-3.5" />
                      Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div>
          <h3 className="font-heading text-base md:text-lg font-bold text-foreground">
            {post.title}
          </h3>
          <MarkdownRenderer content={post.description} />
        </div>

        {/* Actions Bar (Likes and Comments toggle) */}
        <div className="flex items-center justify-between pt-3 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleLike}
              className={cn(
                "gap-1.5 font-semibold text-xs transition-colors cursor-pointer",
                isLiked
                  ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className={cn("size-3.5", isLiked && "fill-current")} />
              <span>{likes}</span>
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => setCommentsOpen(!commentsOpen)}
              className="gap-1.5 font-semibold text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <MessageSquare className="size-3.5" />
              <span>
                {totalComments} {totalComments === 1 ? "Comment" : "Comments"}
              </span>
              {commentsOpen ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Expandable Comments Section */}
        {commentsOpen && (
          <div className="pt-3 border-t border-border/70 space-y-4">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary" />
              Comments ({totalComments})
            </h4>

            {/* Inline Comment Composer */}
            {user ? (
              <CommentComposer postId={post.id} />
            ) : (
              <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border">
                Please sign in to join this discussion.
              </p>
            )}

            {/* Comments List */}
            {isCommentsLoading ? (
              <div className="py-4 text-center text-xs text-muted-foreground">
                Loading comments...
              </div>
            ) : fetchedComments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                No comments yet on this post. Be the first to share your
                thoughts!
              </p>
            ) : (
              <div className="space-y-2.5">
                {fetchedComments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    communitySlug={communitySlug}
                  />
                ))}

                {hasNextPage && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                      className="text-xs font-semibold text-primary"
                    >
                      {isFetchingNextPage
                        ? "Loading more comments..."
                        : "Load earlier comments"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <EditPostModal
        post={post}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <DeletePostDialog
        post={post}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}
