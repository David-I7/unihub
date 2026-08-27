import { useParams, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { CommunityBreadcrumb } from "@/features/communities";
import {
  useStudyYearHome,
  StudyYearCoursesList,
  StudyYearSkeleton,
} from "@/features/studyYears";
import { Button, buttonVariants } from "@/components/ui/button";

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
        <CommunityBreadcrumb />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load study year details.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
            <Link
              to={`/communities/${communitySlug}`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <ArrowLeft className="size-4" /> Back to Community
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 pb-12">
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black drop-shadow-xs">
        {studyYear.studyYear.studyYearName} <span className="">Courses</span>
      </h1>

      <CommunityBreadcrumb />

      {/* Courses List with Full-width Semester & Archived Tabs and Search */}
      <StudyYearCoursesList
        courses={studyYear.courses}
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
      />
    </div>
  );
}
