import { useState, useMemo, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Heart,
  MessageSquare,
  Share2,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowLeft,
  Pin,
  PinOff,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/app/UserAvatar";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatPostDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import {
  usePost,
  useTogglePostLike,
  usePinPost,
  EditPostModal,
  DeletePostDialog,
} from "@/features/posts";
import { useInfinitePostComments } from "@/features/comments/api/getPostComments";
import { CommentComposer } from "@/features/comments/components/CommentComposer";
import { CommentItem } from "@/features/comments/components/CommentItem";

export default function PostDetailPage() {
  const { postId = "" } = useParams<{ postId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const commentId = searchParams.get("commentId");

  const { data: post, isLoading, isError, refetch } = usePost(postId);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const user = useAuthStore((state) => state.user);
  const { canPinPost, canEditPost, canDeletePost } = usePermissions(
    post?.communitySlug,
  );

  const likeMutation = useTogglePostLike();
  const pinMutation = usePinPost();

  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (post) {
      setLikes(post.likesCount);
      setIsLiked(Boolean(post.isLiked));
    }
  }, [post]);

  const {
    data: commentsData,
    isLoading: isCommentsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfinitePostComments(
    postId,
    { size: 20 },
    { enabled: Boolean(postId) },
  );

  const fetchedComments = useMemo(() => {
    return commentsData?.pages.flatMap((p) => p.content) ?? [];
  }, [commentsData]);

  // Scroll to targeted comment when loaded
  useEffect(() => {
    if (commentId && fetchedComments.length > 0) {
      const el = document.getElementById(`comment-${commentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [commentId, fetchedComments]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="h-6 w-48 bg-muted rounded-md animate-pulse" />
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <ErrorStateCard
          message="Post not found or has been deleted."
          onRetry={() => refetch()}
          backTo="/communities"
          backLabel="Back to Communities"
        />
      </div>
    );
  }

  const isPostAuthor = Boolean(
    user && post.owner && String(user.id) === String(post.owner.id),
  );
  const canPin = canPinPost;
  const canEdit = canEditPost(post.owner?.id);
  const canDelete = canDeletePost(post.owner?.id);
  const hasActions = canPin || canEdit || canDelete;

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Post link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handlePostDeleted = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate("/communities");
    }
  };

  // Construct back destination
  const backUrl =
    post.courseSlug && post.studyYearSlug && post.communitySlug
      ? `/communities/${post.communitySlug}/study-years/${post.studyYearSlug}/courses/${post.courseSlug}?tab=posts`
      : post.communitySlug
        ? `/communities/${post.communitySlug}?tab=posts`
        : "/communities";

  const backLabel = post.courseName
    ? `Back to ${post.courseName}`
    : post.communityName
      ? `Back to ${post.communityName}`
      : "Back to Discussions";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={backUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{backLabel}</span>
        </Link>
      </div>

      {/* Main Post Card */}
      <Card className="rounded-2xl border bg-card p-6 shadow-xs space-y-5">
        {/* Header: Author info, badges, actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <UserAvatar username={post.owner?.username} size="default" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  {post.owner?.username ?? "Anonymous"}
                </span>
                {isPostAuthor && (
                  <span className="rounded-md bg-secondary text-secondary-foreground border border-border/50 px-1.5 py-0.2 text-[10px] font-bold">
                    Author
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {formatPostDate(post.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                  {canPin && (
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

                  {(canPin || canEdit) && canDelete && (
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

        {/* Post Title & Description */}
        <div className="space-y-3">
          <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {post.title}
          </h1>
          <div className="text-sm leading-relaxed">
            <MarkdownRenderer content={post.description} />
          </div>
        </div>

        {/* Actions Bar (Likes, Comment count, Share) */}
        <div className="flex items-center justify-between pt-4 border-t border-border/70 text-xs">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="xs"
              onClick={handleLike}
              className={cn(
                "gap-1.5 font-semibold text-xs cursor-pointer transition-colors",
                isLiked
                  ? "text-rose-500 dark:text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Heart className={cn("size-3.5", isLiked && "fill-current")} />
              <span>{likes}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopyLink}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {isCopied ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Share2 className="size-3.5" />
            )}
            <span>{isCopied ? "Copied!" : "Share"}</span>
          </Button>
        </div>
      </Card>

      {/* Discussion Section */}
      <section className="space-y-4">
        <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="size-4 text-foreground" />
          <span>Comments ({post.commentsCount ?? 0})</span>
        </h2>

        {/* Comment Composer */}

        {true ? (
          <CommentComposer postId={post.id} />
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">
            Please sign in to join this discussion.
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-3 pt-2">
          {isCommentsLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
              <Spinner className="size-5 text-primary" />
              <span>Loading discussion...</span>
            </div>
          ) : fetchedComments.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-dashed border-border bg-card p-6">
              <p className="text-xs text-muted-foreground italic">
                No replies yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fetchedComments.map((comment) => {
                const isTargetComment = comment.id === commentId;
                return (
                  <div
                    key={comment.id}
                    id={`comment-${comment.id}`}
                    className={cn(
                      "transition-all duration-500 rounded-2xl",
                      isTargetComment &&
                        "ring-2 ring-primary/80 bg-primary/[0.04] p-1.5",
                    )}
                  >
                    <CommentItem
                      comment={comment}
                      communitySlug={post.communitySlug ?? undefined}
                    />
                  </div>
                );
              })}

              {hasNextPage && (
                <div className="pt-3 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {isFetchingNextPage ? (
                      <span className="flex items-center gap-1.5">
                        <Spinner className="size-3.5" />
                        Loading more...
                      </span>
                    ) : (
                      "Load earlier replies"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Edit & Delete Dialogs */}
      <EditPostModal
        post={post}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <DeletePostDialog
        post={post}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handlePostDeleted}
      />
    </div>
  );
}
