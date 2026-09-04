import { useState } from "react";
import { Star, FileText, Edit2 as Edit3, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import { usePermissions } from "@/hooks/usePermissions";
import { TeacherDetailDialog, type Teacher } from "@/features/teachers";
import { EditCourseReadmeModal } from "./EditCourseReadmeModal";
import type { Course } from "../api/types";

interface CourseAboutTabProps {
  communitySlug?: string;
  studyYearSlug?: string;
  course: Course;
  teachers?: Teacher[];
}

export function CourseAboutTab({
  communitySlug = "",
  studyYearSlug = "",
  course,
  teachers = [],
}: CourseAboutTabProps) {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);
  const { canEditCourse } = usePermissions(communitySlug);
  const hasReadme = Boolean(course.readme && course.readme.trim().length > 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Primary Column (Left 2/3): Abstract + Full Markdown Syllabus */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Overview */}
          {course.description && (
            <Card className="rounded-2xl border bg-card px-6 shadow-xs space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
                <span>Overview</span>
              </h2>
              <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                {course.description}
              </p>
            </Card>
          )}

          {/* Full Markdown Readme */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Readme</span>
              </h2>

              {canEditCourse &&
                !course.archived &&
                communitySlug &&
                studyYearSlug && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setReadmeModalOpen(true)}
                    className="gap-1 text-xs font-semibold cursor-pointer"
                  >
                    {hasReadme ? (
                      <>
                        <Edit3 className="size-3" />
                        <span>Edit Readme</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3" />
                        <span>Add Readme</span>
                      </>
                    )}
                  </Button>
                )}
            </div>

            {hasReadme ? (
              <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
                <MarkdownRenderer content={course.readme!} />
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <FileText className="size-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    No Readme Published Yet
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    No readme or course guidelines have been published for this
                    course yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column (Right 1/3): Quick Specifications + Faculty Roster */}
        <div className="space-y-6">
          {/* Quick Course Specifications */}
          <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
              <span>Course Specifications</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Course Abbreviation
                </span>
                <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded text-primary">
                  {course.abbreviation}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Semester</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  Semester {course.semester}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Academic Value</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  {course.creditPoints} ECTS Credits
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`font-semibold ${
                    course.archived
                      ? "text-amber-500"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {course.archived ? "Archived" : "Active"}
                </span>
              </div>
            </div>
          </Card>

          {/* Teaching Faculty Card */}
          <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
              <span>Teaching Staff ({teachers.length})</span>
            </h3>

            {teachers.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No instructor assigned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher: Teacher) => (
                  <div
                    key={teacher.id}
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-all hover:bg-muted/50 hover:border-primary/40 cursor-pointer group"
                  >
                    <UserAvatar
                      username={teacher.lastName || teacher.firstName}
                      className="size-9 rounded-lg transition-transform group-hover:scale-105"
                      fallbackClassName="rounded-lg"
                    />

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        Prof. {teacher.firstName} {teacher.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          {teacher.averageRating?.toFixed(1) ?? "5.0"}
                        </span>
                        <span>•</span>
                        <span>{teacher.ratingsCount ?? 0} reviews</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <TeacherDetailDialog
        teacherId={selectedTeacherId}
        open={Boolean(selectedTeacherId)}
        onOpenChange={(isOpen) => !isOpen && setSelectedTeacherId(null)}
      />

      {communitySlug && studyYearSlug && (
        <EditCourseReadmeModal
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          course={course}
          open={readmeModalOpen}
          onOpenChange={setReadmeModalOpen}
        />
      )}
    </>
  );
}
