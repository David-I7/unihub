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
import { useDeleteCourse } from "../api/deleteCourse";
import type { Course, CourseCardInfo } from "../api/types";

interface DeleteCourseDialogProps {
  communitySlug: string;
  studyYearSlug: string;
  course: Course | CourseCardInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteCourseDialog({
  communitySlug,
  studyYearSlug,
  course,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCourseDialogProps) {
  const deleteMutation = useDeleteCourse();

  if (!course) return null;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        communitySlug,
        studyYearSlug,
        courseSlug: course.slug,
      });

      toast.success(`Course "${course.name}" was deleted successfully.`);
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete course."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {course.name}?</DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{course.name}</strong> (
              <span className="font-mono">{course.abbreviation}</span>) from
              this curriculum?
            </p>
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              Warning: All folders, study materials, files, links, and
              discussions associated with this course will be permanently
              removed.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
