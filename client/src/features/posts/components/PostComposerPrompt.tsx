import { useState } from "react";
import { PenLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth";
import { getInitials } from "@/lib/utils";
import { PostComposerModal } from "./PostComposerModal";
import type { PostTarget } from "../api/types";

interface PostComposerPromptProps {
  target: PostTarget;
  placeholder?: string;
}

export function PostComposerPrompt({
  target,
  placeholder = "Start a discussion, share study tips, or ask a question...",
}: PostComposerPromptProps) {
  const [open, setOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  const userInitials = getInitials(user?.username);

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="group flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-4 shadow-xs hover:border-primary/50 transition-all cursor-pointer"
      >
        <Avatar size="default" className="border border-border shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 rounded-xl bg-muted/50 px-4 py-2.5 text-xs sm:text-sm text-muted-foreground group-hover:text-foreground/80 group-hover:bg-muted transition-colors">
          {placeholder}
        </div>

        <Button
          type="button"
          size="sm"
          className="gap-1.5 font-bold shadow-xs shrink-0 cursor-pointer"
        >
          <PenLine className="size-3.5" />
          <span className="hidden sm:inline">New Post</span>
        </Button>
      </Card>

      <PostComposerModal
        target={target}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
