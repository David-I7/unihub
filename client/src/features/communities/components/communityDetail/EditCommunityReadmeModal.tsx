import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import { Eye, Edit2 as Edit3, Code } from "@/components/ui/icons";
import { Heading1, Bold, Italic, List, Table as TableIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/api/types";
import { useUpdateCommunity } from "../../api/updateCommunity";
import type { Community } from "../../api/types";

interface EditCommunityReadmeModalProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCommunityReadmeModal({
  community,
  open,
  onOpenChange,
}: EditCommunityReadmeModalProps) {
  const [readme, setReadme] = useState(community.readme ?? "");
  const [activeMobileView, setActiveMobileView] = useState<"edit" | "preview">(
    "edit",
  );
  const updateMutation = useUpdateCommunity();

  const isEditing = Boolean(
    community.readme && community.readme.trim().length > 0,
  );

  const handleInsertSnippet = (before: string, after: string = "") => {
    setReadme((prev) => `${prev}\n${before}${after}`);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        communitySlug: community.slug,
        payload: {
          readme: readme.trim() || undefined,
        },
      });

      toast.success(
        isEditing
          ? "Community Readme document updated successfully!"
          : "Community Readme document created successfully!",
      );
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save Readme markdown."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col rounded-2xl border shadow-2xl"
        contentClassName="p-0 gap-0 h-full flex-1 flex flex-col min-h-0 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-0 pb-3 border-b border-border/70 pr-10 sm:pr-12 shrink-0">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate">
                  {isEditing
                    ? "Edit Community Readme"
                    : "Create Community Readme"}
                </DialogTitle>
                <DialogDescription className="text-xs truncate">
                  {isEditing
                    ? `Update documentation for ${community.name}.`
                    : `Write documentation using Markdown for ${community.name}.`}
                </DialogDescription>
              </div>

              {/* Mobile View Toggle (Tab-like design) */}
              <div className="flex sm:hidden items-center shrink-0 rounded-xl bg-muted/60 p-1 border border-border/40 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveMobileView("edit")}
                  className={cn(
                    "inline-flex h-7.5 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150 cursor-pointer",
                    activeMobileView === "edit"
                      ? "bg-background text-foreground shadow-xs dark:bg-card dark:border dark:border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                  )}
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMobileView("preview")}
                  className={cn(
                    "inline-flex h-7.5 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all duration-150 cursor-pointer",
                    activeMobileView === "preview"
                      ? "bg-background text-foreground shadow-xs dark:bg-card dark:border dark:border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                  )}
                >
                  <Eye className="size-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Quick Markdown Toolbar */}
          <div className="flex items-center gap-1.5 pt-3 overflow-x-auto pb-1 max-w-full">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleInsertSnippet("## Section Title\n\n")}
              className="gap-1 text-xs shrink-0"
              title="Add Heading"
            >
              <Heading1 className="size-3" />
              Heading
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleInsertSnippet("**bold text**")}
              className="gap-1 text-xs shrink-0"
              title="Add Bold"
            >
              <Bold className="size-3" />
              Bold
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleInsertSnippet("*italic text*")}
              className="gap-1 text-xs shrink-0"
              title="Add Italic"
            >
              <Italic className="size-3" />
              Italic
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                handleInsertSnippet("- Item 1\n- Item 2\n- Item 3\n")
              }
              className="gap-1 text-xs shrink-0"
              title="Add List"
            >
              <List className="size-3" />
              List
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                handleInsertSnippet("```ts\nconsole.log('code');\n```\n")
              }
              className="gap-1 text-xs shrink-0"
              title="Add Code Block"
            >
              <Code className="size-3" />
              Code
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() =>
                handleInsertSnippet(
                  "| Course | Credits | Semester |\n| :--- | :--- | :--- |\n| Math I | 6 ECTS | 1 |\n",
                )
              }
              className="gap-1 text-xs shrink-0"
              title="Add Markdown Table"
            >
              <TableIcon className="size-3" />
              Table
            </Button>
          </div>
        </div>

        {/* Split Pane Editor & Live Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 flex-1 min-h-0 divide-y sm:divide-y-0 sm:divide-x divide-border overflow-hidden">
          {/* Left Column: Markdown Input */}
          <div
            className={`flex flex-col h-full min-h-0 min-w-0 p-4 sm:p-2 space-y-2 overflow-hidden ${
              activeMobileView === "preview" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-0.5 shrink-0">
              <span>Markdown Source</span>
              <span>{readme.length} / 50,000 chars</span>
            </div>
            <div className="flex-1 min-h-0 relative h-full">
              <Textarea
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                placeholder="# Community Overview&#10;&#10;Write detailed curriculum instructions, academic resources, or community guidelines here..."
                maxLength={50000}
                className="w-full h-full min-h-0 resize-none font-mono text-xs leading-relaxed p-3 sm:p-3.5 border border-input rounded-xl bg-background overflow-y-auto [field-sizing:normal]"
              />
            </div>
          </div>

          {/* Right Column: Live Rendered Preview */}
          <div
            className={`flex flex-col h-full min-h-0 min-w-0 p-4 sm:p-2 space-y-2 bg-muted/20 overflow-hidden ${
              activeMobileView === "edit" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="text-xs font-semibold text-muted-foreground pb-0.5 shrink-0">
              Live Preview
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-6 overflow-y-auto overflow-x-auto min-h-0 flex-1 break-words">
              {readme.trim() ? (
                <MarkdownRenderer content={readme} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground italic">
                  <p>
                    Nothing to preview yet. Start typing markdown on the left.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-3.5 sm:p-4 border-t border-border bg-muted/30 -mx-0 -mb-0 mt-0 rounded-b-2xl sm:flex-row sm:justify-end flex gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="gap-1.5 font-bold cursor-pointer"
          >
            {updateMutation.isPending
              ? "Saving..."
              : isEditing
                ? "Save Readme"
                : "Create Readme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
