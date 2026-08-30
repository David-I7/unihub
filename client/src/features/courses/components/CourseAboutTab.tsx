import { Star, Award, Archive, Calendar, Info, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/app/UserAvatar";
import { Card } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import type { Teacher } from "@/features/teachers";
import type { CourseTeachers } from "@/features/courses";

export function CourseAboutTab({ course, teachers = [] }: CourseTeachers) {
  const hasReadme = Boolean(course.readme && course.readme.trim().length > 0);

  return (
    <div className="max-w-4xl space-y-6 py-2">
      {/* Top Section: Course Details & Metadata */}
      <div className="space-y-6">
        {/* Title & Badges */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
              {course.abbreviation}
            </span>

            <Badge variant="outline" className="text-xs font-semibold gap-1">
              <Calendar className="size-3.5" />
              <span>Semester {course.semester}</span>
            </Badge>

            <Badge variant="secondary" className="text-xs font-semibold gap-1">
              <Award className="size-3.5" />
              <span>{course.creditPoints} ECTS</span>
            </Badge>

            {course.archived && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold gap-1"
              >
                <Archive className="size-3" />
                Archived
              </Badge>
            )}
          </div>
        </div>

        {/* Brief Description Callout */}
        {course.description && (
          <Card className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Info className="size-4" />
              <span>Course Overview</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed font-normal">
              {course.description}
            </p>
          </Card>
        )}

        {/* Professors & Faculty Section */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Course Faculty & Instructors
          </h2>

          {teachers.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No instructor assigned yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4 pt-1">
              {teachers.map((teacher: Teacher) => {
                return (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2 transition-colors hover:bg-muted/50"
                  >
                    <UserAvatar
                      username={teacher.lastName || teacher.firstName}
                      className="size-8 rounded-lg"
                      fallbackClassName="rounded-lg"
                    />

                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-foreground leading-none">
                        Prof. {teacher.firstName} {teacher.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground leading-none">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="size-3 fill-amber-500 text-amber-500" />
                          {teacher.averageRating?.toFixed(1) ?? "5.0"}
                        </span>
                        <span>•</span>
                        <span>{teacher.ratingsCount ?? 0} reviews</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <hr className="border-border/60" />

      {/* Bottom Section: Markdown Readme / Syllabus */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <FileText className="size-3.5" />
          <span>Curriculum & Syllabus Readme</span>
        </h2>

        {hasReadme ? (
          <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
            <MarkdownRenderer content={course.readme} />
          </Card>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
            <p className="text-xs text-muted-foreground italic">
              No additional curriculum readme has been published for this course yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

