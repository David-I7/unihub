import { StudyYearsGrid, useStudyYears, type StudyYear } from "@/features/studyYears";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface CommunityStudyYearsTabProps {
  communitySlug: string;
  studyYears?: StudyYear[];
  onStudyYearSelect?: (studyYear: StudyYear) => void;
}

export function CommunityStudyYearsTab({
  communitySlug,
  studyYears: propStudyYears,
  onStudyYearSelect,
}: CommunityStudyYearsTabProps) {
  const {
    data: queriedStudyYears = [],
    isLoading,
    isError,
    refetch,
  } = useStudyYears(propStudyYears ? "" : communitySlug);

  const studyYears = propStudyYears ?? queriedStudyYears;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border bg-card p-5 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <Skeleton className="size-11 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Failed to load study years.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

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
