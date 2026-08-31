import { useState } from "react";
import { toast } from "sonner";
import { Eye, Edit3 } from "lucide-react";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import {
  createPostSchema,
  type CreatePostFormData,
} from "../schemas/postSchemas";
import { useCreatePost } from "../api/createPost";
import type { PostTarget } from "../api/types";

interface PostComposerModalProps {
  target: PostTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostComposerModal({
  target,
  open,
  onOpenChange,
}: PostComposerModalProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const createMutation = useCreatePost();

  const form = useForm<CreatePostFormData>({
    initialValues: {
      title: "",
      description: "",
    },
    schema: createPostSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await createMutation.mutateAsync({
          target,
          payload: {
            title: values.title.trim(),
            description: values.description.trim(),
          },
        });

        toast.success("Post published successfully!");
        onOpenChange(false);
        form.reset();
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to publish post.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>
            Share an announcement, ask questions, or start an academic
            discussion.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          {/* Title */}
          <Field>
            <FieldLabel htmlFor="postTitle">Title *</FieldLabel>
            <Input
              id="postTitle"
              placeholder="e.g. Question regarding Lecture 4 Algorithm proofs..."
              value={form.values.title}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("title")}
              name="title"
              maxLength={150}
            />
            <FieldError errors={[{ message: form.errors.title }]} />
          </Field>

          {/* Description / Content with Tabs */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="postDescription">Content *</FieldLabel>
              <Tabs
                value={activeTab}
                onValueChange={(val) =>
                  setActiveTab(val as "write" | "preview")
                }
                className="w-auto"
              >
                <TabsList className="h-7 p-0.5 bg-muted rounded-lg">
                  <TabsTrigger
                    value="write"
                    className="text-xs h-6 px-2.5 gap-1"
                  >
                    <Edit3 className="size-3" />
                    Write
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="text-xs h-6 px-2.5 gap-1"
                  >
                    <Eye className="size-3" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {activeTab === "write" ? (
              <div className="space-y-1">
                <Textarea
                  id="postDescription"
                  name="description"
                  placeholder="Provide context, formulas, code snippets, or discussion points (Markdown supported)..."
                  rows={6}
                  value={form.values.description}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  aria-invalid={form.isInvalid("description")}
                  maxLength={20000}
                  className="font-mono text-xs leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Markdown formatting is supported.</span>
                  <span>{form.values.description.length} / 20000</span>
                </div>
              </div>
            ) : (
              <div className="min-h-[150px] max-h-[250px] overflow-y-auto rounded-xl border border-border/80 bg-muted/20 p-4 text-xs">
                {form.values.description.trim() ? (
                  <MarkdownRenderer content={form.values.description} />
                ) : (
                  <p className="text-muted-foreground italic text-center py-8">
                    Nothing to preview yet.
                  </p>
                )}
              </div>
            )}
            <FieldError errors={[{ message: form.errors.description }]} />
          </Field>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.isSubmitting || createMutation.isPending}
              className="gap-1.5 font-bold cursor-pointer"
            >
              {form.isSubmitting || createMutation.isPending
                ? "Publishing..."
                : "Publish Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
