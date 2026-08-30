import { Star, Award, Calendar, FileText, Info, Users, BookOpen } from "lucide-react";
import { UserAvatar } from "@/components/app/UserAvatar";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import type { Teacher } from "@/features/teachers";
import type { CourseTeachers } from "@/features/courses";

export function CourseAboutTab({ course, teachers = [] }: CourseTeachers) {
  const hasReadme = Boolean(course.readme && course.readme.trim().length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Primary Column (Left 2/3): Abstract + Full Markdown Syllabus */}
      <div className="lg:col-span-2 space-y-6">
        {/* Course Overview */}
        {course.description && (
          <Card className="rounded-2xl border bg-card p-6 shadow-xs space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="size-4 text-primary" />
              <span>Overview</span>
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed font-normal">
              {course.description}
            </p>
          </Card>
        )}

        {/* Full Markdown Readme */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 px-1">
            <FileText className="size-4 text-primary" />
            <span>Readme</span>
          </h2>

          {hasReadme ? (
            <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
              <MarkdownRenderer content={course.readme} />
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-2">
              <FileText className="size-8 text-muted-foreground/50" />
              <h3 className="font-heading text-sm font-semibold text-foreground">
                No Readme Published Yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No readme has been published for this course yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Column (Right 1/3): Quick Specifications + Faculty Roster */}
      <div className="space-y-6">
        {/* Quick Course Specifications */}
        <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
            <Info className="size-3.5 text-primary" />
            <span>Course Specifications</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Course Code</span>
              <span className="font-mono font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded text-primary">
                {course.abbreviation}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Semester</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground" />
                Semester {course.semester}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Academic Value</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Award className="size-3 text-muted-foreground" />
                {course.creditPoints} ECTS Credits
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`font-semibold ${
                  course.archived ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {course.archived ? "Archived" : "Active Curriculum"}
              </span>
            </div>
          </div>
        </Card>

        {/* Teaching Faculty Card */}
        <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 border-b pb-3">
            <Users className="size-3.5 text-primary" />
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
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                >
                  <UserAvatar
                    username={teacher.lastName || teacher.firstName}
                    className="size-9 rounded-lg"
                    fallbackClassName="rounded-lg"
                  />

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">
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
  );
}



