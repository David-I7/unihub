import { useParams } from "react-router";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import {
  useStudyYearHome,
  StudyYearCoursesList,
  StudyYearSkeleton,
} from "@/features/studyYears";

export default function StudyYearDetailPage() {
  const { communitySlug = "", studyYearSlug = "" } = useParams<{
    communitySlug: string;
    studyYearSlug: string;
  }>();

  const {
    data: studyYear,
    isLoading,
    isError,
    refetch,
  } = useStudyYearHome(communitySlug, studyYearSlug, {
    includeArchived: true,
  });

  if (isLoading) {
    return <StudyYearSkeleton />;
  }

  if (isError || !studyYear) {
    return (
      <div className="min-h-full space-y-6 pb-12">
        <AppBreadcrumb />
        <ErrorStateCard
          message="Failed to load study year details."
          onRetry={() => refetch()}
          backTo={`/communities/${communitySlug}`}
          backLabel="Back to Community"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 pb-12">
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black drop-shadow-xs">
        {studyYear.studyYear.studyYearName} <span className="">Courses</span>
      </h1>

      <AppBreadcrumb />

      {/* Courses List with Full-width Semester & Archived Tabs and Search */}
      <StudyYearCoursesList
        courses={studyYear.courses}
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
      />
    </div>
  );
}
