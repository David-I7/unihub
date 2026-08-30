import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
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
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  ColorPicker,
  DEFAULT_COMMUNITY_PRESETS,
} from "@/components/ui/color-picker";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import {
  createCommunitySchema,
  type CreateCommunityFormData,
} from "../schemas/communitySchemas";
import { useCreateCommunity } from "../api/createCommunity";

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateCommunityModal({
  open,
  onOpenChange,
}: CreateCommunityModalProps) {
  const navigate = useNavigate();
  const createMutation = useCreateCommunity();
  const [slugTouchedManually, setSlugTouchedManually] = useState(false);

  const form = useForm<CreateCommunityFormData>({
    initialValues: {
      name: "",
      slug: "",
      description: "",
      readme: "",
      backgroundColor: DEFAULT_COMMUNITY_PRESETS[0]!,
    },
    schema: createCommunitySchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const created = await createMutation.mutateAsync({
          name: values.name.trim(),
          slug: values.slug.trim(),
          description: values.description.trim(),
          readme: values.readme?.trim() || undefined,
          backgroundColor: values.backgroundColor,
        });

        toast.success(`Community "${created.name}" created successfully!`);
        onOpenChange(false);
        form.reset();
        navigate(`/communities/${created.slug}`);
      } catch (err: unknown) {
        const message = getErrorMessage(
          err,
          "Failed to create community. Please check your inputs.",
        );
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = e.target.value;
    form.setValue("name", nextName);
    if (!slugTouchedManually) {
      form.setValue("slug", slugify(nextName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouchedManually(true);
    form.setValue("slug", slugify(e.target.value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Community</DialogTitle>
          <DialogDescription>
            Set up an academic community hub for your university, faculty, or
            specialization.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 py-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          {/* Name Field */}
          <Field>
            <FieldLabel htmlFor="name">Community Name *</FieldLabel>
            <Input
              id="name"
              placeholder="e.g. Faculty of Mathematics and Informatics"
              value={form.values.name}
              onChange={handleNameChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("name")}
            />
            <FieldError errors={[{ message: form.errors.name }]} />
          </Field>

          {/* Slug Field */}
          <Field>
            <FieldLabel htmlFor="slug">Community Slug (URL path) *</FieldLabel>
            <Input
              id="slug"
              placeholder="fmi-faculty"
              value={form.values.slug}
              onChange={handleSlugChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("slug")}
              className="font-mono text-xs"
            />
            <FieldDescription>
              Will be accessible at: /communities/{form.values.slug || "slug"}
            </FieldDescription>
            <FieldError errors={[{ message: form.errors.slug }]} />
          </Field>

          {/* Brief Description */}
          <Field>
            <FieldLabel htmlFor="description">
              Brief Summary / Description *
            </FieldLabel>
            <Textarea
              id="description"
              placeholder="A short summary of this community displayed in hero cards..."
              rows={3}
              value={form.values.description}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("description")}
              maxLength={1000}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Shown in community banners and catalog cards.</span>
              <span>{form.values.description.length} / 1000</span>
            </div>
            <FieldError errors={[{ message: form.errors.description }]} />
          </Field>

          {/* Optional Readme Markdown */}
          <Field>
            <FieldLabel htmlFor="readme">
              Overview / Readme (Markdown Optional)
            </FieldLabel>
            <Textarea
              id="readme"
              placeholder="# Welcome to our Faculty&#10;&#10;Here you can find all course curricula, study years, and discussions..."
              rows={4}
              value={form.values.readme ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("readme")}
              maxLength={50000}
              className="font-mono text-xs"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Full markdown document rendered in the About tab.</span>
              <span>{(form.values.readme ?? "").length} / 50000</span>
            </div>
            <FieldError errors={[{ message: form.errors.readme }]} />
          </Field>

          {/* Color Picker */}
          <Field>
            <FieldLabel>Community Accent & Gradient Theme</FieldLabel>
            <ColorPicker
              value={form.values.backgroundColor}
              onChange={(hex) => form.setValue("backgroundColor", hex)}
              showPreview={true}
              showPresets={true}
              presets={DEFAULT_COMMUNITY_PRESETS}
            />
            <FieldError errors={[{ message: form.errors.backgroundColor }]} />
          </Field>

          <DialogFooter className="pt-4">
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
              className="font-bold cursor-pointer"
            >
              {form.isSubmitting || createMutation.isPending
                ? "Creating Community..."
                : "Create Community"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
