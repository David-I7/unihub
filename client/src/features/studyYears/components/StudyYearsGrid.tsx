import { Calendar } from "@/components/ui/icons";
import { StudyYearCard } from "./StudyYearCard";
import { studyYearNameToSlug, type StudyYearMetrics } from "../api/types";
import { useNavigate } from "react-router";
import type { CallerMembership } from "@/features/communities/api/types";

interface StudyYearsGridProps {
  studyYears: StudyYearMetrics[];
  communitySlug: string;
  callerMembership?: CallerMembership | null;
  onStudyYearSelect?: (studyYear: StudyYearMetrics) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function StudyYearsGrid({
  studyYears,
  communitySlug,
  callerMembership,
  onStudyYearSelect,
  emptyTitle = "No Study Years Available",
  emptyDescription = "There are no study years registered here yet.",
}: StudyYearsGridProps) {
  const navigate = useNavigate();

  if (!studyYears || studyYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Calendar className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            {emptyTitle}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {studyYears.map((year) => {
        const yearSlug = studyYearNameToSlug(year.studyYearName);
        const destination = `/communities/${communitySlug}/study-years/${yearSlug}`;
        return (
          <StudyYearCard
            key={year.id}
            studyYear={year}
            communitySlug={communitySlug}
            callerMembership={callerMembership}
            onClick={() => {
              if (onStudyYearSelect) {
                onStudyYearSelect(year);
              } else {
                navigate(destination);
              }
            }}
          />
        );
      })}
    </div>
  );
}
