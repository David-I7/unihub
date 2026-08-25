import { useParams, Link } from "react-router";
import {
  Info,
  FolderOpen,
  Calendar,
  CheckSquare,
  Video,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { useCommunityDetail, CommunityBreadcrumb, CommunityPostsTab } from "@/features/communities";
import { useStudyYearDetail } from "@/features/studyYears";
import {
  CourseAboutTab,
  CourseMaterialsTab,
  CourseExamsTab,
  CourseAssignmentsTab,
  CourseLecturesTab,
  CourseSkeleton,
} from "@/features/courses";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";

export default function CourseDetailPage() {
  const {
    communitySlug = "",
    studyYearSlug = "",
    courseId = "",
  } = useParams<{
    communitySlug: string;
    studyYearSlug: string;
    courseId: string;
  }>();

  const {
    data: community,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
  } = useCommunityDetail(communitySlug);

  const {
    data: studyYear,
    isLoading: isStudyYearLoading,
    isError: isStudyYearError,
    refetch,
  } = useStudyYearDetail(communitySlug, studyYearSlug, {
    includeArchived: true,
  });

  const isLoading = isCommunityLoading || isStudyYearLoading;
  const isError = isCommunityError || isStudyYearError;

  if (isLoading) {
    return <CourseSkeleton />;
  }

  const course = studyYear?.courses.find(
    (c) => String(c.id) === String(courseId),
  );

  if (isError || !community || !studyYear || !course) {
    return (
      <div className="min-h-full space-y-6 pb-12">
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

            <TabsTrigger value="exams">
              <Calendar className="size-4" />
              <span>Exams</span>
            </TabsTrigger>

            <TabsTrigger value="assignments">
              <CheckSquare className="size-4" />
              <span>Assignments</span>
            </TabsTrigger>

            <TabsTrigger value="lectures">
              <Video className="size-4" />
              <span>Lectures</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="about" className="focus-visible:outline-none">
          <CourseAboutTab course={course} />
        </TabsContent>

        <TabsContent value="materials" className="focus-visible:outline-none">
          <CourseMaterialsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseId={courseId}
          />
        </TabsContent>

        <TabsContent value="discussions" className="focus-visible:outline-none">
          <CommunityPostsTab communitySlug={communitySlug} />
        </TabsContent>

        <TabsContent value="exams" className="focus-visible:outline-none">
          <CourseExamsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseId={courseId}
          />
        </TabsContent>

        <TabsContent value="assignments" className="focus-visible:outline-none">
          <CourseAssignmentsTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseId={courseId}
          />
        </TabsContent>

        <TabsContent value="lectures" className="focus-visible:outline-none">
          <CourseLecturesTab
            communitySlug={communitySlug}
            studyYearSlug={studyYearSlug}
            courseId={courseId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
