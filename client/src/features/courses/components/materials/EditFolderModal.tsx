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
import {
  updateFolderSchema,
  type UpdateFolderFormData,
} from "../../schemas/materialSchemas";
import { useUpdateFolder } from "../../api/updateFolder";
import type { CourseMaterialFolder } from "../../api/types";

interface EditFolderModalProps {
  folder: CourseMaterialFolder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updatedFolder: CourseMaterialFolder) => void;
}

function EditFolderForm({
  folder,
  onClose,
  onSuccess,
}: {
  folder: CourseMaterialFolder;
  onClose: () => void;
  onSuccess?: (updatedFolder: CourseMaterialFolder) => void;
}) {
  const updateMutation = useUpdateFolder();

  const form = useForm<UpdateFolderFormData>({
    initialValues: {
      name: folder.name ?? "",
    },
    schema: updateFolderSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const updated = await updateMutation.mutateAsync({
          folderId: folder.id,
          payload: {
            name: values.name.trim(),
          },
        });

        toast.success("Folder renamed successfully!");
        onSuccess?.(updated);
        onClose();
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to update folder.");
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

      <Field>
        <FieldLabel htmlFor="editFolderName">Folder Name</FieldLabel>
        <Input
          id="editFolderName"
          name="name"
          value={form.values.name}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          aria-invalid={form.isInvalid("name")}
          maxLength={100}
          autoFocus
        />
        <FieldError errors={[{ message: form.errors.name }]} />
      </Field>

      <DialogFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
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

export function EditFolderModal({
  folder,
  open,
  onOpenChange,
  onSuccess,
}: EditFolderModalProps) {
  if (!folder) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>Change the folder display name.</DialogDescription>
        </DialogHeader>

        {open && (
          <EditFolderForm
            key={folder.id}
            folder={folder}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
