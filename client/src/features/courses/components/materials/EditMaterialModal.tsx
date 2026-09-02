import { toast } from "sonner";
import {
  Globe,
  Video,
  FileText,
  GitBranch,
  Folder,
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
  updateMaterialSchema,
  detectLinkType,
  type UpdateMaterialFormData,
} from "../../schemas/materialSchemas";
import { useUpdateMaterial } from "../../api/updateMaterial";
import type {
  CourseMaterialFile,
  CourseMaterialLink,
  MaterialLinkType,
} from "../../api/types";

interface EditMaterialModalProps {
  material:
    | { type: "file"; data: CourseMaterialFile }
    | { type: "link"; data: CourseMaterialLink }
    | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: CourseMaterialFile | CourseMaterialLink) => void;
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
    label: "external video",
    hint: "YouTube, Vimeo, Loom, Twitch",
    icon: Video,
    iconColor: "text-rose-500",
  },
  {
    value: "GITHUB",
    label: "repo",
    hint: "GitHub, GitLab, Bitbucket",
    icon: GitBranch,
    iconColor: "text-foreground",
  },
  {
    value: "DOCS",
    label: "google docs",
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
    label: "google drive or microsoft onedrive",
    hint: "Google Drive, OneDrive, SharePoint",
    icon: Folder,
    iconColor: "text-amber-500",
  },
  {
    value: "OTHER",
    label: "https",
    hint: "Any valid HTTPS URL",
    icon: Globe,
    iconColor: "text-emerald-500",
  },
];

function EditMaterialForm({
  material,
  onClose,
  onSuccess,
}: {
  material:
    | { type: "file"; data: CourseMaterialFile }
    | { type: "link"; data: CourseMaterialLink };
  onClose: () => void;
  onSuccess?: (updated: CourseMaterialFile | CourseMaterialLink) => void;
}) {
  const updateMutation = useUpdateMaterial();
  const isLink = material.type === "link";
  const linkData = isLink ? (material.data as CourseMaterialLink) : null;

  const form = useForm<UpdateMaterialFormData>({
    initialValues: {
      title: material.data.title ?? "",
      description: material.data.description ?? "",
      url: linkData?.url ?? "",
      linkType: (linkData?.linkType as MaterialLinkType) ?? "OTHER",
    },
    schema: updateMaterialSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const dirty = form.dirtyFields;
        const payload: Record<string, unknown> = {};

        if (dirty.title) payload.title = values.title?.trim();
        if (dirty.description)
          payload.description = values.description?.trim() || undefined;

        if (isLink) {
          if (dirty.url) payload.url = values.url?.trim();
          if (dirty.linkType) payload.linkType = values.linkType;
        }

        const updated = await updateMutation.mutateAsync({
          materialId: material.data.id,
          payload,
        });

        toast.success("Resource updated successfully!");
        onSuccess?.(updated);
        onClose();
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update resource.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    form.handleChange(e);

    if (rawVal.trim()) {
      const detected = detectLinkType(rawVal.trim());
      form.setValue("linkType", detected);
    }
  };

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
      {form.serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {form.serverError}
        </div>
      )}

      {/* Title Field */}
      <Field>
        <FieldLabel htmlFor="editMaterialTitle">Title</FieldLabel>
        <Input
          id="editMaterialTitle"
          name="title"
          value={form.values.title ?? ""}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          aria-invalid={form.isInvalid("title")}
          maxLength={200}
          autoFocus
        />
        <FieldError errors={[{ message: form.errors.title }]} />
      </Field>

      {/* If Link, show URL and Type */}
      {isLink && (
        <>
          <Field>
            <FieldLabel htmlFor="editMaterialUrl">Destination URL</FieldLabel>
            <Input
              id="editMaterialUrl"
              name="url"
              value={form.values.url ?? ""}
              onChange={handleUrlChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("url")}
            />
            <FieldError errors={[{ message: form.errors.url }]} />
          </Field>

          <Field>
            <FieldLabel htmlFor="editResourceType">Resource Type</FieldLabel>
            <Select
              value={form.values.linkType}
              onValueChange={(val: string | null) => {
                if (val) {
                  form.setValue("linkType", val as MaterialLinkType);
                }
              }}
            >
              <SelectTrigger
                id="editResourceType"
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
        </>
      )}

      {/* Description Field */}
      <Field>
        <FieldLabel htmlFor="editMaterialDescription">
          Description{" "}
          <span className="text-muted-foreground font-normal">(Optional)</span>
        </FieldLabel>
        <Textarea
          id="editMaterialDescription"
          name="description"
          rows={4}
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            form.isSubmitting || updateMutation.isPending || !form.isDirty
          }
          className="gap-1.5 font-bold cursor-pointer"
        >
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditMaterialModal({
  material,
  open,
  onOpenChange,
  onSuccess,
}: EditMaterialModalProps) {
  if (!material) return null;

  const isLink = material.type === "link";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLink ? "Edit Resource Link" : "Edit File Details"}
          </DialogTitle>
          <DialogDescription>
            Update the title, notes, and resource details.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditMaterialForm
            key={material.data.id}
            material={material}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
