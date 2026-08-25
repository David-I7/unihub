import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Comment } from "@/types/domain";

interface CommentItemProps {
  comment: Comment;
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

export function CommentItem({ comment }: CommentItemProps) {
  const commentInitials = comment.owner?.username
    ? comment.owner.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="rounded-xl bg-muted/40 p-3 space-y-1.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar size="sm" className="size-5 border border-border">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
              {commentInitials}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-foreground">
            {comment.owner?.username ?? "Anonymous"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {formatDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-muted-foreground pl-7 leading-relaxed whitespace-pre-line">
        {comment.content}
      </p>
    </div>
  );
}
