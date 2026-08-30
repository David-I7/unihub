import { useState } from "react";
import { toast } from "sonner";
import { Send, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/features/auth";
import { getInitials } from "@/lib/utils";
import { getErrorMessage } from "@/api/types";
import { useCreateComment } from "../api/createComment";

interface CommentComposerProps {
  postId: string;
}

export function CommentComposer({ postId }: CommentComposerProps) {
  const [content, setContent] = useState("");
  const user = useAuthStore((state) => state.user);
  const createMutation = useCreateComment();

  const userInitials = getInitials(user?.username);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanContent = content.trim();
    if (!cleanContent) return;

    try {
      await createMutation.mutateAsync({
        postId,
        payload: { content: cleanContent },
      });
      setContent("");
      toast.success("Comment posted!");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to post comment."));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5 items-start pt-2">
      <Avatar size="sm" className="size-6 shrink-0 mt-1 border border-border">
        <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
          {userInitials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="relative">
          <Textarea
            placeholder="Write a comment... (Ctrl+Enter to send)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            maxLength={2000}
            className="text-xs resize-none pr-10 py-2 min-h-[60px] rounded-xl bg-background"
          />

          <Button
            type="submit"
            size="icon-xs"
            disabled={!content.trim() || createMutation.isPending}
            className="absolute bottom-2 right-2 size-6 rounded-lg cursor-pointer"
            title="Send comment"
          >
            <Send className="size-3" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
          <span className="hidden sm:inline flex items-center gap-1">
            <CornerDownLeft className="size-2.5" /> Press Ctrl+Enter to post
          </span>
          <span>{content.length} / 2000</span>
        </div>
      </div>
    </form>
  );
}
