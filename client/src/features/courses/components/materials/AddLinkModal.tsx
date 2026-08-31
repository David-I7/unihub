import { toast } from "sonner";
import { Link2, Folder } from "lucide-react";
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
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import {
  createLinkSchema,
  detectLinkType,
  type CreateLinkFormData,
} from "../../schemas/materialSchemas";
import { useCreateMaterialLink } from "../../api/createMaterialLink";
import type { MaterialLinkType } from "../../api/types";

interface AddLinkModalProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  parentFolderId?: string | null;
  parentFolderName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LINK_TYPE_OPTIONS: Array<{
  value: MaterialLinkType;
  label: string;
  hint: string;
}> = [
  {
    value: "GITHUB",
    label: "GitHub",
    hint: "github.com, gist.github.com, raw.githubusercontent.com",
  },
  {
    value: "DRIVE",
    label: "Google Drive / Docs",
    hint: "drive.google.com, docs.google.com",
  },
  {
    value: "VIDEO",
    label: "Video / Stream",
    hint: "youtube.com, youtu.be, vimeo.com, loom.com, twitch.tv",
  },
  {
    value: "DOCS",
    label: "Documents / Notes",
    hint: "docs.google.com, notion.so, office.com",
  },
  {
    value: "DOCX",
    label: "Word / DOCX",
    hint: "Office documents, docx files, SharePoint",
  },
  {
    value: "OTHER",
    label: "Other Resource",
    hint: "Any valid HTTPS URL",
  },
];

export function AddLinkModal({
  communitySlug,
  studyYearSlug,
  courseSlug,
  parentFolderId,
  parentFolderName = "Root",
  open,
  onOpenChange,
}: AddLinkModalProps) {
  const createMutation = useCreateMaterialLink();

  const form = useForm<CreateLinkFormData>({
    initialValues: {
      title: "",
      description: "",
      url: "",
      linkType: "OTHER",
    },
    schema: createLinkSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await createMutation.mutateAsync({
          communitySlug,
          studyYearSlug,
          courseSlug,
          payload: {
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
            url: values.url.trim(),
            linkType: values.linkType,
            folderId: parentFolderId || null,
          },
        });

        toast.success(`Link "${values.title.trim()}" added successfully!`);
        form.reset();
        onOpenChange(false);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to add resource link.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset();
    }
    onOpenChange(nextOpen);
  };

  // Handle URL change with auto link type detection
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    form.handleChange(e);

    if (rawVal.trim()) {
      const detected = detectLinkType(rawVal.trim());
      form.setValue("linkType", detected);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add External Resource Link</DialogTitle>
          <DialogDescription>
            Attach external learning resources such as GitHub repositories, Google Docs, or video tutorials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 py-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          {/* Target Location */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border text-xs text-muted-foreground">
            <Folder className="size-4 text-primary shrink-0" />
            <span>Target location:</span>
            <span className="font-semibold text-foreground truncate">
              {parentFolderName}
            </span>
          </div>

          {/* URL Input */}
          <Field>
            <FieldLabel htmlFor="linkUrl">Destination URL</FieldLabel>
            <Input
              id="linkUrl"
              name="url"
              placeholder="https://github.com/org/repo or https://drive.google.com/..."
              value={form.values.url}
              onChange={handleUrlChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("url")}
              autoFocus
            />
            <FieldDescription>
              Link type is automatically detected from the entered domain.
            </FieldDescription>
            <FieldError errors={[{ message: form.errors.url }]} />
          </Field>

          {/* Link Type Selector */}
          <Field>
            <FieldLabel>Resource Type</FieldLabel>
            <div className="grid grid-cols-2 gap-2 pt-1">
              {LINK_TYPE_OPTIONS.map((opt) => {
                const isSelected = form.values.linkType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setValue("linkType", opt.value)}
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50 text-foreground"
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] text-muted-foreground truncate w-full mt-0.5">
                      {opt.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            <FieldError errors={[{ message: form.errors.linkType }]} />
          </Field>

          {/* Title Field */}
          <Field>
            <FieldLabel htmlFor="linkTitle">Title</FieldLabel>
            <Input
              id="linkTitle"
              name="title"
              placeholder="e.g. Official Course GitHub Repository"
              value={form.values.title}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("title")}
              maxLength={200}
            />
            <FieldError errors={[{ message: form.errors.title }]} />
          </Field>

          {/* Description Field */}
          <Field>
            <FieldLabel htmlFor="linkDescription">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
            </FieldLabel>
            <Textarea
              id="linkDescription"
              name="description"
              rows={3}
              placeholder="Add extra guidance, repo branch info, or access instructions..."
              value={form.values.description ?? ""}
              onChange={form.handleChange}
              maxLength={2000}
              className="text-xs"
            />
            <FieldDescription>
              {(form.values.description ?? "").length} / 2000 characters
            </FieldDescription>
            <FieldError errors={[{ message: form.errors.description }]} />
          </Field>

          <DialogFooter className="pt-2">
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
              <Link2 className="size-4" />
              {createMutation.isPending ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
