import { GraduationCap, ArrowLeft, BookOpen, Award, Archive } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { StudyYearDetail } from "../api/types";
import type { Community } from "@/features/communities";

interface StudyYearHeroProps {
  community: Community;
  studyYear: StudyYearDetail;
  studyYearSlug: string;
}

export function StudyYearHero({
  community,
  studyYear,
}: StudyYearHeroProps) {
  const activeCourses = studyYear.courses.filter((ct) => !ct.course.archived);
  const archivedCourses = studyYear.courses.filter((ct) => ct.course.archived);
  const totalCredits = activeCourses.reduce(
    (acc, ct) => acc + (ct.course.creditPoints || 0),
    0,
  );

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              to={`/communities/${community.slug}`}
              className={buttonVariants({
                variant: "ghost",
                size: "xs",
                className: "gap-1 text-muted-foreground hover:text-foreground -ml-2",
              })}
            >
              <ArrowLeft className="size-3.5" />
              <span>{community.name}</span>
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Badge variant="secondary" className="font-mono text-xs font-bold">
              {studyYear.studyYear.studyYearName}
            </Badge>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <GraduationCap className="size-7 text-primary" />
            <span>{studyYear.studyYear.studyYearName}</span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
            Curriculum overview, course materials, and exam schedules for {studyYear.studyYear.studyYearName}.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 shrink-0">
          <div className="rounded-xl border bg-muted/20 px-3.5 py-2.5 text-center">
            <span className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="size-3" /> Active
            </span>
            <p className="font-heading text-sm font-bold text-foreground mt-0.5">
              {activeCourses.length}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 px-3.5 py-2.5 text-center">
            <span className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Award className="size-3" /> Credits
            </span>
            <p className="font-heading text-sm font-bold text-foreground mt-0.5">
              {totalCredits} ECTS
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 px-3.5 py-2.5 text-center">
            <span className="flex items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Archive className="size-3 text-amber-500" /> Archived
            </span>
            <p className="font-heading text-sm font-bold text-foreground mt-0.5">
              {archivedCourses.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
