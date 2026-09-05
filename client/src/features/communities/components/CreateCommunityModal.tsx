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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  ColorPicker,
  DEFAULT_COMMUNITY_PRESETS,
} from "@/components/ui/color-picker";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import { useAuthStore } from "@/features/auth";
import { CommunityCard } from "./CommunityCard";
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

function CreateCommunityForm({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const createMutation = useCreateCommunity();
  const [slugTouchedManually, setSlugTouchedManually] = useState(false);

  const form = useForm<CreateCommunityFormData>({
    initialValues: {
      name: "",
      slug: "",
      description: "",
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
          backgroundColor: values.backgroundColor,
        });

        toast.success(`Community "${created.name}" created successfully!`);
        onClose();
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

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    form.setValue("description", e.target.value);
  };

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6 pt-2">
      {form.serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {form.serverError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-4">
          {/* Name Field */}
          <Field>
            <FieldLabel htmlFor="name">Name *</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Faculty of Informatics"
              value={form.values.name}
              onChange={handleNameChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("name")}
            />
            <FieldError errors={[{ message: form.errors.name }]} />
          </Field>

          {/* Slug Field */}
          <Field>
            <FieldLabel htmlFor="slug">Slug *</FieldLabel>
            <Input
              id="slug"
              name="slug"
              placeholder="e.g. faculty-of-informatics"
              value={form.values.slug}
              onChange={handleSlugChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("slug")}
              className="font-mono text-xs"
            />
            <FieldError errors={[{ message: form.errors.slug }]} />
          </Field>

          {/* Brief Description */}
          <Field>
            <FieldLabel htmlFor="description">Description *</FieldLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="A short summary of this community displayed in catalog cards..."
              rows={3}
              value={form.values.description}
              onChange={handleDescriptionChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("description")}
              maxLength={1000}
            />
            <FieldError errors={[{ message: form.errors.description }]} />
          </Field>

          {/* Minimal Color Picker */}
          <Field>
            <FieldLabel>Theme Accent & Gradient</FieldLabel>
            <ColorPicker
              value={form.values.backgroundColor}
              onChange={(hex) => form.setValue("backgroundColor", hex)}
            />
            <FieldError errors={[{ message: form.errors.backgroundColor }]} />
          </Field>
        </div>

        {/* Right Column: Live Community Preview */}
        <div className="lg:col-span-5 space-y-3 sticky top-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Live Preview
            </span>
          </div>
          <div className="rounded-2xl pointer-events-none">
            <CommunityCard
              community={{
                id: "preview",
                name: form.values.name.trim() || "Community Name",
                slug: form.values.slug.trim() || "community-slug",
                description:
                  form.values.description.trim() ||
                  "Your community description will appear here as you type.",
                backgroundColor: form.values.backgroundColor,
                verified: false,
                memberCount: 1,
                joined: true,
                createdAt: new Date().toISOString(),
                owner: {
                  id: user?.id ?? "preview-user",
                  username: user?.username ?? "You",
                  active: true,
                },
              }}
            />
          </div>
        </div>
      </div>

      <DialogFooter className="pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={form.isSubmitting || createMutation.isPending}
        >
          {form.isSubmitting || createMutation.isPending
            ? "Creating Community..."
            : "Create Community"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateCommunityModal({
  open,
  onOpenChange,
}: CreateCommunityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a New Community</DialogTitle>
          <DialogDescription>
            Set up an academic community hub for your university or faculty.
          </DialogDescription>
        </DialogHeader>

        <CreateCommunityForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
