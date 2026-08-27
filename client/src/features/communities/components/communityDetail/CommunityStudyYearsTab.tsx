import { StudyYearsGrid, type StudyYearMetrics } from "@/features/studyYears";

interface CommunityStudyYearsTabProps {
  communitySlug: string;
  studyYears: StudyYearMetrics[];
  onStudyYearSelect?: (studyYear: StudyYearMetrics) => void;
}

export function CommunityStudyYearsTab({
  communitySlug,
  studyYears: propStudyYears,
  onStudyYearSelect,
}: CommunityStudyYearsTabProps) {
  return (
    <div className="space-y-4">
      <StudyYearsGrid
        studyYears={propStudyYears}
        communitySlug={communitySlug}
        onStudyYearSelect={onStudyYearSelect}
        emptyTitle="No Study Years Available"
        emptyDescription="This community does not have any study years registered yet."
      />
    </div>
  );
}
