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
import { getErrorMessage } from "@/api/types";
import { useDeleteTeacher } from "../api/deleteTeacher";
import type { Teacher } from "../api/types";

interface DeleteTeacherAlertDialogProps {
  teacher: Teacher | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTeacherAlertDialog({
  teacher,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTeacherAlertDialogProps) {
  const deleteMutation = useDeleteTeacher();

  if (!teacher) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(teacher.id);
      toast.success(`Prof. ${teacher.firstName} ${teacher.lastName} was deleted.`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete teacher."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Teacher</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">
              Prof. {teacher.firstName} {teacher.lastName}
            </strong>
            ? This action will unassign the teacher from associated courses without deleting the courses.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="font-bold cursor-pointer"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Teacher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
