import { useParams, useNavigate } from "react-router";
import { Info, FolderOpen, MessageSquare } from "@/components/ui/icons";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { cn } from "@/lib/utils";
import {
  useCourseHome,
  CourseAboutTab,
  CourseMaterialsTab,
  CoursePostsTab,
  CourseSkeleton,
  CourseActionMenu,
  ArchivedCourseBanner,
} from "@/features/courses";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUrlTab } from "@/hooks/useUrlTab";

const VALID_TABS = ["about", "materials", "posts"] as const;
type CourseTab = (typeof VALID_TABS)[number];
const DEFAULT_TAB: CourseTab = "about";

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

  const navigate = useNavigate();

  const {
    data: courseHome,
    isLoading,
    isError,
    refetch,
  } = useCourseHome(communitySlug, studyYearSlug, courseSlug);

  const [currentTab, setTab] = useUrlTab<CourseTab>(DEFAULT_TAB, {
    validTabs: VALID_TABS,
  });

  if (isLoading) {
    return <CourseSkeleton />;
  }

  if (isError || !courseHome) {
    return (
      <div className="min-h-full space-y-6 pb-12">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
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

  const isArchived = Boolean(courseHome.course.archived);

  const handleCourseDeleted = () => {
    navigate(`/communities/${communitySlug}/study-years/${studyYearSlug}`);
  };

  return (
    <div className="min-h-full space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          {courseHome.course.name}
        </h1>

        <CourseActionMenu
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          course={courseHome.course}
          teachers={courseHome.teachers}
          onDeleted={handleCourseDeleted}
          triggerClassName="size-9 rounded-xl hover:bg-muted cursor-pointer"
        />
      </div>

      <AppBreadcrumb />

      {/* Archived Warning & Unarchive Action Banner */}
      {isArchived && (
        <ArchivedCourseBanner
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          course={courseHome.course}
        />
      )}

      {/* Course Tabs (Top Navigation with greyed-out read-only styling when archived) */}
      <Tabs
        value={currentTab}
        onValueChange={(val) => setTab(val as CourseTab)}
        className={cn(
          "w-full space-y-6 min-w-0 transition-all duration-200",
          isArchived && "opacity-80 grayscale-[30%]",
        )}
      >
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

            <TabsTrigger value="posts">
              <MessageSquare className="size-4" />
              <span>Posts & Discussions</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="about" className="focus-visible:outline-none">
          <CourseAboutTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            course={courseHome.course}
            teachers={courseHome.teachers}
          />
        </TabsContent>

        <TabsContent value="materials" className="focus-visible:outline-none">
          <CourseMaterialsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseSlug={courseSlug}
            isArchived={isArchived}
          />
        </TabsContent>

        <TabsContent value="posts" className="focus-visible:outline-none">
          <CoursePostsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseSlug={courseSlug}
            isArchived={isArchived}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
