import { z } from "zod";
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
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import { useCreateTeacher } from "../api/createTeacher";
import type { Teacher } from "../api/types";

type CreateTeacherFormValues = {
  firstName: string;
  lastName: string;
  estimatedAge: string;
};

const createTeacherSchema: z.ZodType<CreateTeacherFormValues> = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be under 50 characters"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be under 50 characters"),
  estimatedAge: z.string().refine((val) => {
    if (!val || val.trim() === "") return true;
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 18 && num <= 120;
  }, "Age must be a number between 18 and 120"),
});

interface CreateTeacherDialogProps {
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (created: Teacher) => void;
}

function CreateTeacherForm({
  communitySlug,
  onClose,
  onSuccess,
}: {
  communitySlug: string;
  onClose: () => void;
  onSuccess?: (created: Teacher) => void;
}) {
  const createMutation = useCreateTeacher(communitySlug);

  const form = useForm<CreateTeacherFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      estimatedAge: "",
    },
    schema: createTeacherSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const ageNum = values.estimatedAge.trim()
          ? parseInt(values.estimatedAge.trim(), 10)
          : undefined;

        const created = await createMutation.mutateAsync({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          estimatedAge: isNaN(ageNum as number) ? undefined : ageNum,
        });

        toast.success(
          `Prof. ${created.firstName} ${created.lastName} created!`,
        );
        onSuccess?.(created);
        onClose();
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to create teacher.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  return (
    <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
      {form.serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {form.serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="firstName">First Name *</FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            placeholder="e.g. John"
            value={form.values.firstName}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            aria-invalid={form.isInvalid("firstName")}
          />
          <FieldError errors={[{ message: form.errors.firstName }]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="lastName">Last Name *</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            placeholder="e.g. Doe"
            value={form.values.lastName}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            aria-invalid={form.isInvalid("lastName")}
          />
          <FieldError errors={[{ message: form.errors.lastName }]} />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="estimatedAge">Estimated Age (optional)</FieldLabel>
        <Input
          id="estimatedAge"
          name="estimatedAge"
          type="number"
          min={18}
          max={120}
          placeholder="e.g. 45"
          value={form.values.estimatedAge}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          aria-invalid={form.isInvalid("estimatedAge")}
        />
        <FieldError errors={[{ message: form.errors.estimatedAge }]} />
      </Field>

      <DialogFooter className="pt-3 border-t border-border/60">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={form.isSubmitting || createMutation.isPending}
          className="font-bold cursor-pointer"
        >
          {form.isSubmitting || createMutation.isPending
            ? "Creating..."
            : "Add Teacher"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateTeacherDialog({
  communitySlug,
  open,
  onOpenChange,
  onSuccess,
}: CreateTeacherDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Teacher</DialogTitle>
          <DialogDescription>
            Register a faculty member or instructor for this community.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <CreateTeacherForm
            communitySlug={communitySlug}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
