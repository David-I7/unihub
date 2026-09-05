import { useState, useMemo } from "react";
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
import { UserAvatar } from "@/components/app/UserAvatar";
import { UserPlus, Trash2, Search, Users } from "@/components/ui/icons";
import { getErrorMessage } from "@/api/types";
import { useCommunityTeachers } from "@/features/teachers/api/getCommunityTeachers";
import {
  useAddCourseTeacher,
  useRemoveCourseTeacher,
} from "../api/manageCourseTeachers";
import type { Course, CourseCard } from "../api/types";
import type { Teacher, TeacherSummary } from "@/features/teachers/api/types";

interface ManageCourseTeachersModalProps {
  communitySlug: string;
  studyYearSlug: string;
  course: Course | CourseCard;
  currentTeachers?: (Teacher | TeacherSummary)[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCourseTeachersModal({
  communitySlug,
  studyYearSlug,
  course,
  currentTeachers = [],
  open,
  onOpenChange,
}: ManageCourseTeachersModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const addTeacherMutation = useAddCourseTeacher();
  const removeTeacherMutation = useRemoveCourseTeacher();

  const { data: allTeachersData } = useCommunityTeachers(communitySlug, {
    size: 100,
  });
  const allTeachers = useMemo(
    () => allTeachersData?.content ?? [],
    [allTeachersData],
  );

  const assignedTeacherIds = useMemo(
    () => new Set(currentTeachers.map((t) => t.id)),
    [currentTeachers],
  );

  const availableTeachers = useMemo(() => {
    return allTeachers.filter((t) => {
      if (assignedTeacherIds.has(t.id)) return false;
      if (!searchTerm.trim()) return true;
      const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.trim().toLowerCase());
    });
  }, [allTeachers, assignedTeacherIds, searchTerm]);

  const handleAdd = async (teacher: Teacher) => {
    try {
      await addTeacherMutation.mutateAsync({
        communitySlug,
        studyYearSlug,
        courseSlug: course.slug,
        teacherId: teacher.id,
      });
      toast.success(
        `Prof. ${teacher.firstName} ${teacher.lastName} assigned to ${course.name}!`,
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to assign teacher."));
    }
  };

  const handleRemove = async (teacher: Teacher) => {
    try {
      await removeTeacherMutation.mutateAsync({
        communitySlug,
        studyYearSlug,
        courseSlug: course.slug,
        teacherId: teacher.id,
      });
      toast.success(
        `Prof. ${teacher.firstName} ${teacher.lastName} removed from ${course.name}.`,
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to remove teacher."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Faculty: {course.name}</DialogTitle>
          <DialogDescription>
            Assign or unassign instructors and teaching assistants for this course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Currently Assigned Faculty */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-primary" />
              <span>Assigned Instructors ({currentTeachers.length})</span>
            </h4>

            {currentTeachers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No instructors currently assigned to this course.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {currentTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-muted/20 p-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        username={teacher.lastName || teacher.firstName}
                        size="xs"
                        className="size-7 rounded-lg"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          Prof. {teacher.firstName} {teacher.lastName}
                        </p>
                        {"ratingsCount" in teacher &&
                          typeof (teacher as { ratingsCount?: number }).ratingsCount === "number" && (
                            <p className="text-[11px] text-muted-foreground">
                              {(teacher as { ratingsCount: number }).ratingsCount} reviews
                            </p>
                          )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemove(teacher)}
                      disabled={removeTeacherMutation.isPending}
                      className="text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                      title="Remove instructor"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add More Faculty */}
          <div className="space-y-2 pt-3 border-t border-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserPlus className="size-3.5 text-primary" />
              <span>Assign More Instructors</span>
            </h4>

            <div className="relative">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search community teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            {availableTeachers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                {allTeachers.length === 0
                  ? "No teachers available in this community."
                  : "All matching teachers are already assigned."}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 hover:border-primary/40 bg-card p-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar
                        username={teacher.lastName || teacher.firstName}
                        size="xs"
                        className="size-7 rounded-lg"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          Prof. {teacher.firstName} {teacher.lastName}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleAdd(teacher)}
                      disabled={addTeacherMutation.isPending}
                      className="gap-1 font-bold text-xs cursor-pointer shrink-0"
                    >
                      <UserPlus className="size-3" />
                      <span>Assign</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
