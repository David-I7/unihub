import { useParams } from "react-router";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import {
  StudyYearCoursesList,
  formatStudyYearName,
} from "@/features/studyYears";

export default function StudyYearDetailPage() {
  const { communitySlug = "", studyYearSlug = "" } = useParams<{
    communitySlug: string;
    studyYearSlug: string;
  }>();

  const title = formatStudyYearName(studyYearSlug);

  return (
    <div className="min-h-full space-y-6 pb-12">
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
        {title} <span>Courses</span>
      </h1>

      <AppBreadcrumb />

      {/* Courses List with Dropdown Filter, Search, and Infinite Scroll */}
      <StudyYearCoursesList
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
      />
    </div>
  );
}

