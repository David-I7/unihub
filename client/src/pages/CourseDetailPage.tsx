import { useParams } from "react-router";
import { Info, FolderOpen, MessageSquare } from "lucide-react";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import {
  useCourseHome,
  CourseAboutTab,
  CourseMaterialsTab,
  CoursePostsTab,
  CourseSkeleton,
} from "@/features/courses";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CourseDetailPage() {
  const {
    communitySlug = "",
    studyYearSlug = "",
    courseSlug = "",
  } = useParams<{
    communitySlug: string;
    studyYearSlug: string;
    courseSlug: string;
  }>();

  const {
    data: courseHome,
    isLoading,
    isError,
    refetch,
  } = useCourseHome(communitySlug, studyYearSlug, courseSlug);

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (isError || !courseHome) {
    return (
      <div className="min-h-full space-y-6 pb-12">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black drop-shadow-xs">
          Failed to load {courseSlug} details.
        </h1>
        <AppBreadcrumb />
        <ErrorStateCard
          message="Failed to load course details."
          onRetry={() => refetch()}
          backTo={`/communities/${communitySlug}/study-years/${studyYearSlug}`}
          backLabel="Back to Study Year"
        />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 pb-12">
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black drop-shadow-xs">
        {courseHome.course.name}{" "}
      </h1>

      <AppBreadcrumb />

      {/* Course Tabs (Top Navigation) */}
      <Tabs defaultValue="about" className="w-full space-y-6 min-w-0">
        <div className="w-full overflow-x-auto no-scrollbar">
          <TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1 flex-nowrap shrink-0">
            <TabsTrigger value="about">
              <Info className="size-4" />
              <span>About</span>
            </TabsTrigger>

            <TabsTrigger value="materials">
              <FolderOpen className="size-4" />
              <span>Materials</span>
            </TabsTrigger>

            <TabsTrigger value="discussions">
              <MessageSquare className="size-4" />
              <span>Posts & Discussions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="about" className="focus-visible:outline-none">
          <CourseAboutTab
            course={courseHome.course}
            teachers={courseHome.teachers}
          />
        </TabsContent>

        <TabsContent value="materials" className="focus-visible:outline-none">
          <CourseMaterialsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseSlug={courseSlug}
          />
        </TabsContent>

        <TabsContent value="discussions" className="focus-visible:outline-none">
          <CoursePostsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseSlug={courseSlug}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
