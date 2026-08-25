import { useState } from "react";
import {
  Pin,
  Heart,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CommentItem } from "./CommentItem";
import type { Post } from "@/types/domain";

export interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: string) => void;
  className?: string;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export function PostCard({ post, onLikeToggle, className }: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [likes, setLikes] = useState(post.likesCount);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikes((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    onLikeToggle?.(post.id);
  };

  const authorInitials = post.owner?.username
    ? post.owner.username.slice(0, 2).toUpperCase()
    : "U";

  const totalComments = post.commentsCount ?? post.comments?.length ?? 0;

  return (
    <Card
      className={cn(
        "rounded-2xl border bg-card p-5 md:p-6 shadow-xs space-y-4 transition-all",
        post.pinned && "border-primary/40 bg-primary/2",
        className,
      )}
    >
      {/* Header: Author info, badges, and timestamp */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar size="default" className="border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {authorInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                {post.owner?.username ?? "Anonymous"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {post.pinned && (
            <Badge
              variant="secondary"
              className="bg-primary/15 text-primary border-primary/20 font-semibold text-[11px] gap-1 py-0.5 px-2"
            >
              <Pin className="size-3 fill-primary/30" />
              Pinned
            </Badge>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        <h3 className="font-heading text-base font-bold text-foreground">
          {post.title}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
          {post.description}
        </p>
      </div>

      {/* Actions and Metrics */}
      <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleLike}
            className={cn(
              "gap-1.5 font-semibold text-xs",
              isLiked
                ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
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
            className="gap-1.5 font-semibold text-xs text-muted-foreground hover:text-foreground"
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

      {/* Expandable Comments List */}
      {commentsOpen && (
        <div className="pt-3 border-t border-border space-y-3">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-primary" />
            Comments ({totalComments})
          </h4>

          {!post.comments || post.comments.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No comments yet on this post.
            </p>
          ) : (
            <div className="space-y-2.5 pl-2 border-l-2 border-primary/20">
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
