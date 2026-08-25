import { BookOpen, Star, Archive, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Course } from "@/features/studyYears";
import type { Community } from "@/features/communities";

interface CourseHeroProps {
  community: Community;
  studyYearSlug: string;
  studyYearName?: string;
  course: Course;
}

export function CourseHero({
  community,
  studyYearSlug,
  studyYearName,
  course,
}: CourseHeroProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-3 flex-1">
          {/* Top Breadcrumb & Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/communities/${community.slug}/study-years/${studyYearSlug}`}
              className={buttonVariants({
                variant: "ghost",
                size: "xs",
                className: "gap-1 text-muted-foreground hover:text-foreground -ml-2",
              })}
            >
              <ArrowLeft className="size-3.5" />
              <span>{studyYearName || studyYearSlug}</span>
            </Link>

            <span className="text-muted-foreground/40">•</span>

            <span className="rounded-lg bg-primary px-3 py-1 font-mono text-xs font-bold text-primary-foreground">
              {course.abbreviation}
            </span>

            <Badge variant="outline" className="text-xs font-semibold">
              Semestrul {course.semester}
            </Badge>

            <Badge variant="secondary" className="text-xs font-semibold">
              {course.creditPoints} ECTS
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

          {/* Course Name */}
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {course.name}
          </h1>

          {/* Description */}
          {course.description && (
            <div className="rounded-xl border bg-muted/20 p-4 text-xs leading-relaxed text-muted-foreground">
              <div className="flex items-center gap-2 font-bold text-foreground mb-1">
                <BookOpen className="size-4 text-primary" />
                <span>Course Overview & Syllabus</span>
              </div>
              <p className="whitespace-pre-line leading-relaxed">
                {course.description}
              </p>
            </div>
          )}
        </div>

        {/* Assigned Teachers Chips */}
        {course.teachers && course.teachers.length > 0 && (
          <div className="flex flex-col gap-2 shrink-0 md:max-w-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Instructors
            </span>
            <div className="space-y-2">
              {course.teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3 shadow-2xs"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold shrink-0">
                    {teacher.lastName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-foreground truncate">
                      Prof. {teacher.firstName} {teacher.lastName}
                    </p>
                    <div className="flex items-center gap-1 text-amber-500 font-bold mt-0.5">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      <span>{teacher.averageRating?.toFixed(1) ?? "5.0"}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({teacher.ratingsCount ?? 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
