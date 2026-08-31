import { useState } from "react";
import { toast } from "sonner";
import {
  MoreVertical,
  Edit2,
  Users,
  Archive,
  ArchiveRestore,
  Trash2,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/hooks/usePermissions";
import { getErrorMessage } from "@/api/types";
import { useArchiveCourse } from "../api/archiveCourse";
import { EditCourseModal } from "./EditCourseModal";
import { ManageCourseTeachersModal } from "./ManageCourseTeachersModal";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import type { Course } from "../api/types";
import type { Teacher } from "@/features/teachers/api/types";

interface CourseActionMenuProps {
  communitySlug: string;
  studyYearSlug: string;
  course: Course;
  teachers?: Teacher[];
  onDeleted?: () => void;
  triggerClassName?: string;
  align?: "start" | "end";
}

export function CourseActionMenu({
  communitySlug,
  studyYearSlug,
  course,
  teachers = [],
  onDeleted,
  triggerClassName,
  align = "end",
}: CourseActionMenuProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [teachersOpen, setTeachersOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { canEditCourse, canArchiveCourse, canDeleteCourse } =
    usePermissions(communitySlug);
  const archiveMutation = useArchiveCourse();

  const hasAnyPermission =
    canEditCourse || canArchiveCourse || canDeleteCourse;

  if (!hasAnyPermission) {
    return null;
  }

  const handleToggleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextArchived = !course.archived;
    try {
      await archiveMutation.mutateAsync({
        communitySlug,
        studyYearSlug,
        courseSlug: course.slug,
        archived: nextArchived,
      });

      toast.success(
        nextArchived
          ? `Course "${course.name}" archived.`
          : `Course "${course.name}" unarchived.`,
      );
    } catch (err: unknown) {
      toast.error(
        getErrorMessage(
          err,
          `Failed to ${nextArchived ? "archive" : "unarchive"} course.`,
        ),
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className={
                triggerClassName ??
                "size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer z-10"
              }
              aria-label="Course options"
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align={align} className="w-48">
          {canEditCourse && !course.archived && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setEditOpen(true);
              }}
              className="gap-2 text-xs cursor-pointer"
            >
              <Edit2 className="size-3.5" />
              <span>Edit Course</span>
            </DropdownMenuItem>
          )}

          {canEditCourse && !course.archived && (
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setTeachersOpen(true);
              }}
              className="gap-2 text-xs cursor-pointer"
            >
              <Users className="size-3.5" />
              <span>Manage Teachers</span>
            </DropdownMenuItem>
          )}

          {canArchiveCourse && (
            <DropdownMenuItem
              onClick={handleToggleArchive}
              disabled={archiveMutation.isPending}
              className="gap-2 text-xs cursor-pointer"
            >
              {course.archived ? (
                <>
                  <ArchiveRestore className="size-3.5 text-emerald-500" />
                  <span>Unarchive Course</span>
                </>
              ) : (
                <>
                  <Archive className="size-3.5 text-amber-500" />
                  <span>Archive Course</span>
                </>
              )}
            </DropdownMenuItem>
          )}

          {canDeleteCourse && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
                className="gap-2 text-xs cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Course</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {editOpen && (
        <EditCourseModal
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          course={course}
          initialTeachers={teachers}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      {teachersOpen && (
        <ManageCourseTeachersModal
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          course={course}
          currentTeachers={teachers}
          open={teachersOpen}
          onOpenChange={setTeachersOpen}
        />
      )}

      {deleteOpen && (
        <DeleteCourseDialog
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          course={course}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}
