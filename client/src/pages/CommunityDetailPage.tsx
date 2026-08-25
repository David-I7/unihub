import { useParams, Link } from "react-router";
import { GraduationCap, MessageSquare, ArrowLeft } from "lucide-react";
import {
  useCommunityDetail,
  CommunityBreadcrumb,
  CommunityHero,
  CommunityStudyYearsTab,
  CommunityPostsTab,
  CommunityDetailSkeleton,
} from "@/features/communities";
import { useStudyYears } from "@/features/studyYears";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";

export default function CommunityDetailPage() {
  const { communitySlug = "" } = useParams<{ communitySlug: string }>();

  const {
    data: community,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
    refetch: refetchCommunity,
  } = useCommunityDetail(communitySlug);

  const { data: studyYears } = useStudyYears(communitySlug);

  if (isCommunityLoading) {
    return <CommunityDetailSkeleton />;
  }

  if (isCommunityError || !community) {
    return (
      <div className="min-h-full space-y-6 pb-12">
        <CommunityBreadcrumb />
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load community details.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchCommunity()}
            >
              Try Again
            </Button>
            <Link
              to="/communities"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <ArrowLeft className="size-4" /> Back to Communities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-12">
      {/* Community Hero Header */}
      <CommunityHero community={community} studyYears={studyYears} />

      {/* Main Container for Tabs and Content */}
      <div className="max-w-7xl mx-auto space-y-6 pt-6">
        {/* Main Community Tabs: Study Years (default) & Posts */}
        <Tabs defaultValue="study-years" className="w-full space-y-6 min-w-0">
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1 flex-nowrap shrink-0">
              <TabsTrigger value="study-years">
                <GraduationCap className="size-4" />
                <span>Study Years</span>
              </TabsTrigger>

              <TabsTrigger value="posts">
                <MessageSquare className="size-4" />
                <span>Posts & Discussions</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="study-years"
            className="focus-visible:outline-none"
          >
            <CommunityStudyYearsTab communitySlug={community.slug} />
          </TabsContent>

          <TabsContent value="posts" className="focus-visible:outline-none">
            <CommunityPostsTab communitySlug={community.slug} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
