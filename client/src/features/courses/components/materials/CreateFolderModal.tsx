import { toast } from "sonner";
import { Folder } from "@/components/ui/icons";
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
  createFolderSchema,
  type CreateFolderFormData,
} from "../../schemas/materialSchemas";
import { useCreateFolder } from "../../api/createFolder";

interface CreateFolderModalProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  parentFolderId?: string | null;
  parentFolderName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFolderModal({
  communitySlug,
  studyYearSlug,
  courseSlug,
  parentFolderId,
  parentFolderName = "Root",
  open,
  onOpenChange,
}: CreateFolderModalProps) {
  const createMutation = useCreateFolder();

  const form = useForm<CreateFolderFormData>({
    initialValues: {
      name: "",
    },
    schema: createFolderSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        await createMutation.mutateAsync({
          communitySlug,
          studyYearSlug,
          courseSlug,
          payload: {
            name: values.name.trim(),
            parentFolderId: parentFolderId || null,
          },
        });

        toast.success(`Folder "${values.name.trim()}" created successfully!`);
        form.reset();
        onOpenChange(false);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to create folder.");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
          <DialogDescription>
            Create a subfolder to organize study materials, notes, and
            resources.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          {/* Target Location Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border text-xs text-muted-foreground">
            <Folder className="size-4 text-primary shrink-0" />
            <span>Target location:</span>
            <span className="font-semibold text-foreground truncate">
              {parentFolderName}
            </span>
          </div>

          <Field>
            <FieldLabel htmlFor="folderName">Folder Name</FieldLabel>
            <Input
              id="folderName"
              name="name"
              placeholder="e.g. Lecture Notes, Past Exams"
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.isSubmitting || createMutation.isPending}
              className="gap-1.5 font-bold cursor-pointer"
            >
              {createMutation.isPending ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
