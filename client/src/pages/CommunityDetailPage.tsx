import { useParams } from "react-router";
import {
  GraduationCap,
  MessageSquare,
  FileText,
  Users,
  Contact,
} from "@/components/ui/icons";
import {
  useCommunityHome,
  CommunityHero,
  CommunityHeroSkeleton,
  CommunityStudyYearsTab,
  CommunityStudyYearsTabSkeleton,
  CommunityReadmeTab,
  CommunityReadmeTabSkeleton,
  CommunityPostsTab,
  CommunityPostsTabSkeleton,
  CommunityMembersTab,
  CommunityMembersTabSkeleton,
} from "@/features/communities";
import {
  CommunityTeachersTab,
  CommunityTeachersTabSkeleton,
} from "@/features/teachers";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUrlFilters, type FilterSchema } from "@/hooks/useUrlFilters";

const VALID_TABS = [
  "study-years",
  "teachers",
  "members",
  "readme",
  "posts",
] as const;
type CommunityTab = (typeof VALID_TABS)[number];
const DEFAULT_TAB: CommunityTab = "study-years";

interface CommunityTabsFilter {
  tab: CommunityTab;
}

const TAB_FILTER_SCHEMA: FilterSchema<CommunityTabsFilter> = {
  tab: {
    defaultValue: DEFAULT_TAB,
    allowedValues: VALID_TABS,
    paramKey: "tab",
  },
};

export default function CommunityDetailPage() {
  const { communitySlug = "" } = useParams<{ communitySlug: string }>();

  const {
    data,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
    refetch: refetchCommunity,
  } = useCommunityHome(communitySlug);

  const { filters, setFilter } = useUrlFilters(TAB_FILTER_SCHEMA);
  const currentTab = filters.tab;

  const community = data?.community;
  const studyYears = data?.studyYears ?? [];
  const callerMembership = data?.callerMembership;

  const isInitialLoading =
    isCommunityLoading || !community || community.slug !== communitySlug;

  if (isCommunityError && !community) {
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
      {isInitialLoading ? (
        <CommunityHeroSkeleton />
      ) : (
        <CommunityHero
          community={community}
          studyYears={studyYears}
          callerMembership={callerMembership}
        />
      )}

      {/* Main Container for Tabs and Content */}
      <div className="w-full space-y-6 pt-2">
        {/* Main Community Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={(val) => setFilter("tab", val as CommunityTab)}
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
            {isInitialLoading ? (
              <CommunityStudyYearsTabSkeleton />
            ) : (
              <CommunityStudyYearsTab
                communitySlug={community.slug}
                studyYears={studyYears}
                callerMembership={callerMembership}
              />
            )}
          </TabsContent>

          <TabsContent
            value="teachers"
            className="focus-visible:outline-none"
          >
            {isInitialLoading ? (
              <CommunityTeachersTabSkeleton />
            ) : (
              <CommunityTeachersTab
                communitySlug={community.slug}
                callerMembership={callerMembership}
              />
            )}
          </TabsContent>

          <TabsContent
            value="members"
            className="focus-visible:outline-none"
          >
            {isInitialLoading ? (
              <CommunityMembersTabSkeleton />
            ) : (
              <CommunityMembersTab
                communitySlug={community.slug}
                callerMembership={callerMembership}
              />
            )}
          </TabsContent>

          <TabsContent value="readme" className="focus-visible:outline-none">
            {isInitialLoading ? (
              <CommunityReadmeTabSkeleton />
            ) : (
              <CommunityReadmeTab
                community={community}
                callerMembership={callerMembership}
              />
            )}
          </TabsContent>

          <TabsContent value="posts" className="focus-visible:outline-none">
            {isInitialLoading ? (
              <CommunityPostsTabSkeleton />
            ) : (
              <CommunityPostsTab
                communitySlug={community.slug}
                callerMembership={callerMembership}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
