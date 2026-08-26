import { useParams, Link } from "react-router";
import { Info, FolderOpen, MessageSquare, ArrowLeft } from "lucide-react";
import { CommunityBreadcrumb, CommunityPostsTab } from "@/features/communities";
import {
  useCourseTeachers,
  CourseAboutTab,
  CourseMaterialsTab,
  CourseSkeleton,
} from "@/features/courses";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";

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
    data: courseTeachers,
    isLoading,
    isError,
    refetch,
  } = useCourseTeachers(communitySlug, studyYearSlug, courseSlug);

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (isError || !courseTeachers) {
    return (
      <div className="min-h-full space-y-6 pb-12">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black drop-shadow-xs">
          Failed to load {courseSlug} details.
        </h1>
        <CommunityBreadcrumb />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load course details.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try Again
            </Button>
            <Link
              to={`/communities/${communitySlug}/study-years/${studyYearSlug}`}
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <ArrowLeft className="size-4" /> Back to Study Year
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-6 pb-12">
      <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-black drop-shadow-xs">
        {courseTeachers.course.name}{" "}
      </h1>

      <CommunityBreadcrumb />

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
            course={courseTeachers.course}
            teachers={courseTeachers.teachers}
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
          <CommunityPostsTab communitySlug={communitySlug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
