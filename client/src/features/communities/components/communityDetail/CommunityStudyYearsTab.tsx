import { StudyYearsGrid, type StudyYearSummary } from "@/features/studyYears";

interface CommunityStudyYearsTabProps {
  studyYears: StudyYearSummary[];
  communitySlug: string;
  onStudyYearSelect?: (studyYear: StudyYearSummary) => void;
}

export function CommunityStudyYearsTab({
  studyYears,
  communitySlug,
  onStudyYearSelect,
}: CommunityStudyYearsTabProps) {
  return (
    <div className="space-y-4">
      <StudyYearsGrid
        studyYears={studyYears}
        communitySlug={communitySlug}
        onStudyYearSelect={onStudyYearSelect}
        emptyTitle="No Study Years Available"
        emptyDescription="This community does not have any study years registered yet."
      />
    </div>
  );
}
