import { toast } from "sonner";
import { Check } from "lucide-react";
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
}> = [
  { value: "GITHUB", label: "GitHub" },
  { value: "DRIVE", label: "Google Drive" },
  { value: "VIDEO", label: "Video" },
  { value: "DOCS", label: "Docs" },
  { value: "DOCX", label: "Word" },
  { value: "OTHER", label: "Other" },
];

export function EditMaterialModal({
  material,
  open,
  onOpenChange,
  onSuccess,
}: EditMaterialModalProps) {
  const updateMutation = useUpdateMaterial();

  const isLink = material?.type === "link";
  const linkData = isLink ? (material.data as CourseMaterialLink) : null;

  const form = useForm<UpdateMaterialFormData>({
    initialValues: {
      title: material?.data.title ?? "",
      description: material?.data.description ?? "",
      url: linkData?.url ?? "",
      linkType: (linkData?.linkType as MaterialLinkType) ?? "OTHER",
    },
    schema: updateMaterialSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!material) return;
      try {
        const payload = isLink
          ? {
              title: values.title?.trim(),
              description: values.description?.trim() || undefined,
              url: values.url?.trim(),
              linkType: values.linkType,
            }
          : {
              title: values.title?.trim(),
              description: values.description?.trim() || undefined,
            };

        const updated = await updateMutation.mutateAsync({
          materialId: material.data.id,
          payload,
        });

        toast.success("Resource updated successfully!");
        onSuccess?.(updated);
        onOpenChange(false);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update resource.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  if (!material) return null;

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    form.handleChange(e);

    if (rawVal.trim()) {
      const detected = detectLinkType(rawVal.trim());
      form.setValue("linkType", detected);
    }
  };

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

        <form onSubmit={form.handleSubmit} className="space-y-4 py-2">
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
                <FieldLabel>Resource Type</FieldLabel>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {LINK_TYPE_OPTIONS.map((opt) => {
                    const isSelected = form.values.linkType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => form.setValue("linkType", opt.value)}
                        className={`rounded-xl border py-2 px-3 text-xs font-semibold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                            : "border-border bg-card hover:border-primary/50 text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <FieldError errors={[{ message: form.errors.linkType }]} />
              </Field>
            </>
          )}

          {/* Description Field */}
          <Field>
            <FieldLabel htmlFor="editMaterialDescription">
              Description <span className="text-muted-foreground font-normal">(Optional)</span>
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
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
