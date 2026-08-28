import { useParams } from "react-router";
import { GraduationCap, MessageSquare } from "lucide-react";
import {
  useCommunityHome,
  CommunityHero,
  CommunityStudyYearsTab,
  CommunityPostsTab,
  CommunityDetailSkeleton,
} from "@/features/communities";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CommunityDetailPage() {
  const { communitySlug = "" } = useParams<{ communitySlug: string }>();

  const {
    data,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
    refetch: refetchCommunity,
  } = useCommunityHome(communitySlug);

  const community = data?.community;
  const studyYears = data?.studyYears ?? [];

  if (isCommunityLoading) {
    return <CommunityDetailSkeleton />;
  }

  if (isCommunityError || !community) {
    return (
      <div className="min-h-full space-y-6 pb-12">
        <AppBreadcrumb />
        <ErrorStateCard
          message="Failed to load community details."
          onRetry={() => refetchCommunity()}
          backTo="/communities"
          backLabel="Back to Communities"
        />
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
            <CommunityStudyYearsTab
              communitySlug={community.slug}
              studyYears={studyYears}
            />
          </TabsContent>

          <TabsContent value="posts" className="focus-visible:outline-none">
            <CommunityPostsTab communitySlug={community.slug} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
