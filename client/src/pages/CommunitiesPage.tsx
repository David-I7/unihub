import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import {
  useInfiniteCommunities,
  CommunityHeader,
  CommunitySearch,
  CommunityGrid,
  CommunityGridSkeleton,
  CommunityEmptyState,
  CreateCommunityModal,
  JoinCommunityModal,
  type Community,
} from "@/features/communities";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/features/auth";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ShieldCheck } from "lucide-react";
import { debounce } from "@/lib/performanceUtils";

export default function CommunitiesPage() {
  const [searchParams] = useSearchParams();
  const joinCodeParam = searchParams.get("join") || "";

  const user = useAuthStore((state) => state.user);
  const { canCreateCommunity } = usePermissions();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("memberCount,desc");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(Boolean(joinCodeParam));

  const debouncedUpdate = useMemo(
    () =>
      debounce((value: string) => {
        setDebouncedSearch(value.trim());
      }, 350),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedUpdate(value);
    },
    [debouncedUpdate],
  );

  const queryParams = useMemo(() => {
    return {
      size: 12,
      sort: sortBy,
      search: debouncedSearch || undefined,
      verified: verifiedOnly ? true : undefined,
      joined: activeTab === "my" ? true : undefined,
    };
  }, [debouncedSearch, verifiedOnly, activeTab, sortBy]);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteCommunities(queryParams);

  const allCommunities = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const totalElements = data?.pages[0]?.totalElements ?? allCommunities.length;

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Community Header */}
      <CommunityHeader
        onCreateClick={() => setCreateModalOpen(true)}
        onJoinClick={() => setJoinModalOpen(true)}
        canCreate={canCreateCommunity}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <CommunitySearch
            value={searchInput}
            onChange={handleSearchChange}
            totalCount={totalElements}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scope Tabs (All vs My Communities) */}
          {user && (
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "all" | "my")}
              className="h-9"
            >
              <TabsList className="h-9 p-1 bg-muted/60 rounded-xl">
                <TabsTrigger value="all" className="text-xs px-3">
                  All
                </TabsTrigger>
                <TabsTrigger value="my" className="text-xs px-3">
                  My Communities
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Verified Toggle Filter */}
          <Button
            type="button"
            variant={verifiedOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setVerifiedOnly((prev) => !prev)}
            className="h-9 gap-1.5 text-xs font-semibold rounded-xl"
          >
            <ShieldCheck className={`size-3.5 ${verifiedOnly ? "text-emerald-500" : "text-muted-foreground"}`} />
            <span>Verified</span>
            {verifiedOnly && <Check className="size-3 text-emerald-500 ml-0.5" />}
          </Button>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(val) => { if (val) setSortBy(val); }}>
            <SelectTrigger className="h-9 w-[150px] text-xs rounded-xl">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="memberCount,desc">Most Members</SelectItem>
              <SelectItem value="createdAt,desc">Newest</SelectItem>
              <SelectItem value="name,asc">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <CommunityGridSkeleton count={6} />
      ) : isError ? (
        <ErrorStateCard
          message="Failed to load communities. Please check your connection."
          onRetry={() => refetch()}
        />
      ) : allCommunities.length === 0 ? (
        <CommunityEmptyState
          searchQuery={searchInput}
          onClear={() => handleSearchChange("")}
        />
      ) : (
        <div className="space-y-6">
          <CommunityGrid
            communities={allCommunities}
            onJoinClick={(_comm: Community) => setJoinModalOpen(true)}
          />

          {/* Load More Button */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2 font-semibold rounded-xl"
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner className="size-4" /> Loading more communities...
                  </>
                ) : (
                  "Load More Communities"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <CreateCommunityModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <JoinCommunityModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        prefilledCode={joinCodeParam}
      />
    </div>
  );
}
