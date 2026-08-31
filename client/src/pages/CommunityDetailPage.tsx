import { useParams, useSearchParams } from "react-router";
import { GraduationCap, MessageSquare, FileText, Users, Contact } from "lucide-react";
import {
  useCommunityHome,
  CommunityHero,
  CommunityStudyYearsTab,
  CommunityReadmeTab,
  CommunityPostsTab,
  CommunityMembersTab,
  CommunityDetailSkeleton,
} from "@/features/communities";
import { CommunityTeachersTab } from "@/features/teachers";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VALID_TABS = ["study-years", "teachers", "members", "readme", "posts"] as const;
type CommunityTab = (typeof VALID_TABS)[number];
const DEFAULT_TAB: CommunityTab = "study-years";

export default function CommunityDetailPage() {
  const { communitySlug = "" } = useParams<{ communitySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
    refetch: refetchCommunity,
  } = useCommunityHome(communitySlug);

  const rawTab = searchParams.get("tab");
  const currentTab: CommunityTab =
    rawTab && VALID_TABS.includes(rawTab as CommunityTab)
      ? (rawTab as CommunityTab)
      : DEFAULT_TAB;

  const handleTabChange = (nextTab: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextTab === DEFAULT_TAB) {
          next.delete("tab");
        } else {
          next.set("tab", nextTab);
        }
        return next;
      },
      { replace: true },
    );
  };

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

  const callerMembership = data?.callerMembership;

  return (
    <div className="min-h-full pb-12">
      {/* Community Hero Header */}
      <CommunityHero
        community={community}
        studyYears={studyYears}
        callerMembership={callerMembership}
      />

      {/* Main Container for Tabs and Content */}
      <div className="max-w-7xl mx-auto space-y-6 pt-2">
        {/* Main Community Tabs: Study Years (default), Teachers, Members, About/Readme & Posts */}
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="w-full space-y-6 min-w-0"
        >
          <div className="w-full overflow-x-auto no-scrollbar">
            <TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1 flex-nowrap shrink-0">
              <TabsTrigger value="study-years">
                <GraduationCap className="size-4" />
                <span>Study Years</span>
              </TabsTrigger>

              <TabsTrigger value="teachers">
                <Contact className="size-4" />
                <span>Teachers</span>
              </TabsTrigger>

              <TabsTrigger value="members">
                <Users className="size-4" />
                <span>Members</span>
              </TabsTrigger>

              <TabsTrigger value="readme">
                <FileText className="size-4" />
                <span>Readme</span>
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
              callerMembership={callerMembership}
            />
          </TabsContent>

          <TabsContent
            value="teachers"
            className="focus-visible:outline-none"
          >
            <CommunityTeachersTab
              communitySlug={community.slug}
              callerMembership={callerMembership}
            />
          </TabsContent>

          <TabsContent
            value="members"
            className="focus-visible:outline-none"
          >
            <CommunityMembersTab
              communitySlug={community.slug}
              callerMembership={callerMembership}
            />
          </TabsContent>

          <TabsContent value="readme" className="focus-visible:outline-none">
            <CommunityReadmeTab
              community={community}
              callerMembership={callerMembership}
            />
          </TabsContent>

          <TabsContent value="posts" className="focus-visible:outline-none">
            <CommunityPostsTab
              communitySlug={community.slug}
              callerMembership={callerMembership}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
