import { useState, useMemo } from "react";
import {
  useInfiniteCommunities,
  CommunityHeader,
  CommunitySearch,
  CommunityGrid,
  CommunityGridSkeleton,
  CommunityEmptyState,
} from "@/features/communities";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteCommunities({ size: 12 });

  const allCommunities = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const filteredCommunities = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCommunities;
    }
    const query = searchQuery.toLowerCase().trim();
    return allCommunities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query),
    );
  }, [allCommunities, searchQuery]);

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Community Header with Breadcrumb & Create Button */}
      <CommunityHeader
        onCreateClick={() => {
          alert("Community creation modal will be implemented here.");
        }}
      />

      {/* Search Bar */}
      <CommunitySearch
        value={searchQuery}
        onChange={setSearchQuery}
        totalCount={filteredCommunities.length}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <CommunityGridSkeleton count={6} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load communities. Please check your connection.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : filteredCommunities.length === 0 ? (
        <CommunityEmptyState
          searchQuery={searchQuery}
          onClear={() => setSearchQuery("")}
        />
      ) : (
        <div className="space-y-6">
          <CommunityGrid communities={filteredCommunities} />

          {/* Load More Button for Pagination */}
          {hasNextPage && !searchQuery.trim() && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="gap-2 font-semibold"
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
    </div>
  );
}
