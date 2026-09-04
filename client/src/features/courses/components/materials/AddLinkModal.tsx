import { toast } from "sonner";
import {
  Folder,
  Globe,
  Video,
  FileText,
  GitBranch,
} from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
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
  icon: typeof GitBranch;
  iconColor: string;
}> = [
  {
    value: "VIDEO",
    label: "External video",
    hint: "YouTube, Vimeo, Loom, Twitch",
    icon: Video,
    iconColor: "text-rose-500",
  },
  {
    value: "GITHUB",
    label: "Github repository",
    hint: "GitHub, GitLab, Bitbucket",
    icon: GitBranch,
    iconColor: "text-foreground",
  },
  {
    value: "DOCS",
    label: "Google docs",
    hint: "docs.google.com",
    icon: FileText,
    iconColor: "text-blue-500",
  },
  {
    value: "DOCX",
    label: "Word",
    hint: "Microsoft Word, Office 365, docx",
    icon: FileText,
    iconColor: "text-sky-500",
  },
  {
    value: "DRIVE",
    label: "Google Drive or Microsoft OneDrive",
    hint: "Google Drive, OneDrive, SharePoint",
    icon: Folder,
    iconColor: "text-amber-500",
  },
  {
    value: "OTHER",
    label: "Https",
    hint: "Any valid HTTPS URL",
    icon: Globe,
    iconColor: "text-emerald-500",
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
            Attach external learning resources such as GitHub repositories,
            Google Docs, or video tutorials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
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

          {/* Resource Type Dropdown */}
          <Field>
            <FieldLabel htmlFor="resourceType">Resource Type</FieldLabel>
            <Select
              value={
                LINK_TYPE_OPTIONS.find(
                  (opt) => opt.value === form.values.linkType,
                )!.label
              }
              onValueChange={(val: string | null) => {
                if (val) {
                  form.setValue("linkType", val as MaterialLinkType);
                }
              }}
            >
              <SelectTrigger
                id="resourceType"
                className="w-full h-10 text-xs rounded-xl bg-card border-input"
              >
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                {LINK_TYPE_OPTIONS.map((opt) => {
                  const IconComponent = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2 text-xs py-0.5">
                        <IconComponent
                          className={`size-3.5 ${opt.iconColor} shrink-0`}
                        />
                        <span className="font-semibold text-foreground">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-1 truncate">
                          — {opt.hint}
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
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
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
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
            <FieldDescription className="text-xs text-muted-foreground flex justify-end">
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
              {createMutation.isPending ? "Adding..." : "Add Link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
