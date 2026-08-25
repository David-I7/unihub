import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { StudyYearSummary } from "../api/types";

interface StudyYearCardProps {
  studyYear: StudyYearSummary;
  communitySlug?: string;
  onClick?: () => void;
}

export function StudyYearCard({ studyYear, onClick }: StudyYearCardProps) {
  const yearNumber = studyYear.studyYearName.replace(/\D/g, "") || "1";

  return (
    <Card
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/60 hover:shadow-md cursor-pointer space-y-4"
    >
      {/* Header: Year number block, Title, and Action arrow */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-heading font-extrabold text-base group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
            {yearNumber}
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
              {studyYear.studyYearName}
            </h3>
            <p className="text-xs text-muted-foreground">Academic Curriculum</p>
          </div>
        </div>

        <div className="flex size-8 items-center justify-center rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
          <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Metrics Row (Each metric displayed exactly once) */}
      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
        <div className="rounded-xl bg-muted/40 px-3 py-2 text-center">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Courses
          </span>
          <span className="font-heading text-sm font-bold text-foreground flex items-center justify-center gap-1.5 mt-0.5">
            {studyYear.coursesCount}
          </span>
        </div>

        <div className="rounded-xl bg-muted/40 px-3 py-2 text-center">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Credits
          </span>
          <span className="font-heading text-sm font-bold text-foreground flex items-center justify-center gap-1.5 mt-0.5">
            {studyYear.creditsCount} ECTS
          </span>
        </div>
      </div>
    </Card>
  );
}
