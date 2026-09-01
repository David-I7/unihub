import { useState } from "react";
import { toast } from "sonner";
import { Send } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/app/UserAvatar";
import { useAuthStore } from "@/features/auth";
import { getErrorMessage } from "@/api/types";
import { useCreateComment } from "../api/createComment";

interface CommentComposerProps {
  postId: string;
}

export function CommentComposer({ postId }: CommentComposerProps) {
  const [content, setContent] = useState("");
  const user = useAuthStore((state) => state.user);
  const createMutation = useCreateComment();

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
      <UserAvatar
        username={user?.username}
        size="xs"
        className="size-6 rounded-lg text-[10px]"
        fallbackClassName="rounded-lg"
      />

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
      </div>
    </form>
  );
}
