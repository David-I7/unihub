import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
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
import { useDeleteStudyYear } from "../api/deleteStudyYear";
import {
  formatStudyYearName,
  slugToStudyYearEnum,
  type StudyYearMetrics,
} from "../api/types";

interface DeleteStudyYearDialogProps {
  communitySlug: string;
  studyYear: StudyYearMetrics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteStudyYearDialog({
  communitySlug,
  studyYear,
  open,
  onOpenChange,
  onDeleted,
}: DeleteStudyYearDialogProps) {
  const deleteMutation = useDeleteStudyYear();

  if (!studyYear) return null;

  const displayName = formatStudyYearName(studyYear.studyYearName);
  const enumName = slugToStudyYearEnum(studyYear.studyYearName);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        communitySlug,
        studyYearName: enumName,
      });

      toast.success(`${displayName} was deleted successfully.`);
      onOpenChange(false);
      onDeleted?.();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete study year."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive mb-1">
            <AlertTriangle className="size-6" />
          </div>
          <DialogTitle className="text-destructive">
            Delete {displayName} Curriculum?
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{displayName}</strong> from
              this community?
            </p>
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
              Warning: All courses ({studyYear.coursesCount || 0} active,{" "}
              {studyYear.archivedCoursesCount || 0} archived), materials, and
              related files inside this study year will be permanently deleted.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
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
            className="font-bold cursor-pointer"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Study Year"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
