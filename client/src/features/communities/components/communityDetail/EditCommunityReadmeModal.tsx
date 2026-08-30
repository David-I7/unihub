import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Eye,
  Edit3,
  Check,
  Heading1,
  Bold,
  Italic,
  List,
  Code,
  Table as TableIcon,
} from "lucide-react";
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

      toast.success("Community Readme document updated successfully!");
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to save Readme markdown."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[88vh] max-h-[88vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-border/70">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div>
                  <DialogTitle>Edit Community Readme</DialogTitle>
                  <DialogDescription className="text-xs">
                    Write rich documentation using GitHub Flavored Markdown for{" "}
                    {community.name}.
                  </DialogDescription>
                </div>
              </div>

              {/* Mobile View Toggle */}
              <div className="flex sm:hidden items-center rounded-lg bg-muted p-1 gap-1">
                <Button
                  type="button"
                  variant={activeMobileView === "edit" ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setActiveMobileView("edit")}
                  className="text-xs gap-1"
                >
                  <Edit3 className="size-3" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant={
                    activeMobileView === "preview" ? "secondary" : "ghost"
                  }
                  size="xs"
                  onClick={() => setActiveMobileView("preview")}
                  className="text-xs gap-1"
                >
                  <Eye className="size-3" />
                  Preview
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Quick Markdown Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleInsertSnippet("## Section Title\n\n")}
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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
              className="gap-1 text-xs"
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
            className={`flex flex-col h-full p-4 space-y-2 ${
              activeMobileView === "preview" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1">
              <span>Markdown Source</span>
              <span>{readme.length} / 50,000 chars</span>
            </div>
            <Textarea
              value={readme}
              onChange={(e) => setReadme(e.target.value)}
              placeholder="# Community Overview&#10;&#10;Write detailed curriculum instructions, academic resources, or community guidelines here..."
              maxLength={50000}
              className="flex-1 resize-none font-mono text-xs leading-relaxed p-4 border border-input rounded-xl bg-background"
            />
          </div>

          {/* Right Column: Live Rendered Preview */}
          <div
            className={`flex flex-col h-full p-4 overflow-y-auto space-y-2 bg-muted/20 ${
              activeMobileView === "edit" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div className="text-xs font-semibold text-muted-foreground pb-1">
              Live Preview
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-5 prose prose-neutral dark:prose-invert max-w-none text-xs sm:text-sm overflow-x-auto min-h-[300px]">
              {readme.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground mt-4 mb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="font-heading text-lg font-bold tracking-tight text-foreground mt-4 mb-2 pb-1 border-b border-border/40">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="font-heading text-base font-semibold text-foreground mt-3 mb-1.5">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="leading-relaxed text-foreground/90 my-2">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-1 my-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 space-y-1 my-2">
                        {children}
                      </ol>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-primary font-medium">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="block rounded-lg bg-muted p-3 border border-border/60 font-mono text-xs overflow-x-auto text-foreground my-2">
                          {children}
                        </code>
                      );
                    },
                    table: ({ children }) => (
                      <div className="my-3 w-full overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-left text-xs">
                          {children}
                        </table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="bg-muted px-3 py-1.5 font-bold border-b border-border">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-1.5 border-b border-border/60">
                        {children}
                      </td>
                    ),
                  }}
                >
                  {readme}
                </ReactMarkdown>
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
        <DialogFooter className="p-4 sm:p-5 border-t border-border bg-muted/30">
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
            <Check className="size-4" />
            {updateMutation.isPending ? "Saving..." : "Save Readme"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
