import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit3, Eye, Check } from "lucide-react";
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
  updatePostSchema,
  type UpdatePostFormData,
} from "../schemas/postSchemas";
import { useUpdatePost } from "../api/updatePost";
import type { Post } from "@/types/domain";

interface EditPostModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPostModal({
  post,
  open,
  onOpenChange,
}: EditPostModalProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const updateMutation = useUpdatePost();

  const form = useForm<UpdatePostFormData>({
    initialValues: {
      title: post?.title ?? "",
      description: post?.description ?? "",
    },
    schema: updatePostSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!post) return;
      try {
        await updateMutation.mutateAsync({
          postId: post.id,
          payload: {
            title: values.title?.trim(),
            description: values.description?.trim(),
          },
        });

        toast.success("Post updated successfully!");
        onOpenChange(false);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update post.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            <Edit3 className="size-5" />
          </div>
          <DialogTitle>Edit Discussion Post</DialogTitle>
          <DialogDescription>
            Update the title and content of your discussion post.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 py-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          {/* Title */}
          <Field>
            <FieldLabel htmlFor="editPostTitle">Title</FieldLabel>
            <Input
              id="editPostTitle"
              value={form.values.title ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("title")}
              name="title"
              maxLength={150}
            />
            <FieldError errors={[{ message: form.errors.title }]} />
          </Field>

          {/* Description */}
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="editPostDescription">Content</FieldLabel>
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
                  id="editPostDescription"
                  name="description"
                  rows={6}
                  value={form.values.description ?? ""}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  aria-invalid={form.isInvalid("description")}
                  maxLength={20000}
                  className="font-mono text-xs leading-relaxed"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Markdown formatting is supported.</span>
                  <span>{(form.values.description ?? "").length} / 20000</span>
                </div>
              </div>
            ) : (
              <div className="min-h-[150px] max-h-[250px] overflow-y-auto rounded-xl border border-border/80 bg-muted/20 p-4 text-xs">
                {form.values.description?.trim() ? (
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {form.values.description}
                    </ReactMarkdown>
                  </div>
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
              disabled={form.isSubmitting || updateMutation.isPending}
              className="gap-1.5 font-bold cursor-pointer"
            >
              <Check className="size-4" />
              {form.isSubmitting || updateMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
