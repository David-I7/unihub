import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { formatPostDate } from "@/lib/dateUtils";
import type { Comment } from "@/types/domain";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const commentInitials = getInitials(comment.owner?.username);

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
          {formatPostDate(comment.createdAt)}
        </span>
      </div>
      <p className="text-muted-foreground pl-7 leading-relaxed whitespace-pre-line">
        {comment.content}
      </p>
    </div>
  );
}
