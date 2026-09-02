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
import { useUpdateTeacher } from "../api/updateTeacher";
import type { Teacher } from "../api/types";

type UpdateTeacherFormValues = {
  firstName: string;
  lastName: string;
  estimatedAge: string;
};

const updateTeacherSchema: z.ZodType<UpdateTeacherFormValues> = z.object({
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

interface UpdateTeacherDialogProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: Teacher) => void;
}

function UpdateTeacherForm({
  teacher,
  onClose,
  onSuccess,
}: {
  teacher: Teacher;
  onClose: () => void;
  onSuccess?: (updated: Teacher) => void;
}) {
  const updateMutation = useUpdateTeacher(teacher.id);

  const form = useForm<UpdateTeacherFormValues>({
    initialValues: {
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      estimatedAge:
        teacher.estimatedAge !== undefined && teacher.estimatedAge !== null
          ? String(teacher.estimatedAge)
          : "",
    },
    schema: updateTeacherSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const dirty = form.dirtyFields;
        const payload: Record<string, unknown> = {};

        if (dirty.firstName) payload.firstName = values.firstName.trim();
        if (dirty.lastName) payload.lastName = values.lastName.trim();
        if (dirty.estimatedAge) {
          const ageNum = values.estimatedAge.trim()
            ? parseInt(values.estimatedAge.trim(), 10)
            : undefined;
          payload.estimatedAge = isNaN(ageNum as number) ? undefined : ageNum;
        }

        const updated = await updateMutation.mutateAsync({
          teacherId: teacher.id,
          payload,
        });

        toast.success(
          `Prof. ${updated.firstName} ${updated.lastName} updated!`,
        );
        onSuccess?.(updated);
        onClose();
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update teacher.");
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
          <FieldLabel htmlFor="editFirstName">First Name *</FieldLabel>
          <Input
            id="editFirstName"
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
          <FieldLabel htmlFor="editLastName">Last Name *</FieldLabel>
          <Input
            id="editLastName"
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
        <FieldLabel htmlFor="editEstimatedAge">
          Estimated Age (optional)
        </FieldLabel>
        <Input
          id="editEstimatedAge"
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
          disabled={
            form.isSubmitting || updateMutation.isPending || !form.isDirty
          }
          className="font-bold cursor-pointer"
        >
          {form.isSubmitting || updateMutation.isPending
            ? "Saving Changes..."
            : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UpdateTeacherDialog({
  teacher,
  open,
  onOpenChange,
  onSuccess,
}: UpdateTeacherDialogProps) {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Update profile details for Prof. {teacher.firstName}{" "}
            {teacher.lastName}.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <UpdateTeacherForm
            teacher={teacher}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
