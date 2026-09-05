import { useMemo, useCallback, useState } from "react";
import {
  useInfiniteCommunities,
  CommunityHeader,
  CommunityGrid,
  CommunityGridSkeleton,
  CommunityEmptyState,
} from "@/features/communities";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { ExpandableSearch } from "@/components/app/ExpandableSearch";
import { FilterToggle } from "@/components/app/FilterToggle";
import { SortSelect, type SortOption } from "@/components/app/SortSelect";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShieldCheck } from "@/components/ui/icons";
import { useObserver } from "@/hooks/useObserver";
import {
  useUrlFilters,
  useDebouncedInput,
  type FilterSchema,
} from "@/hooks/useUrlFilters";

const COMMUNITIES_SORT_OPTIONS: SortOption[] = [
  { field: "memberCount", dir: "desc", label: "Most members" },
  { field: "memberCount", dir: "asc", label: "Fewest members" },
  { field: "createdAt", dir: "desc", label: "Newest first" },
  { field: "createdAt", dir: "asc", label: "Oldest first" },
  { field: "name", dir: "asc", label: "Name (A → Z)" },
  { field: "name", dir: "desc", label: "Name (Z → A)" },
];

interface CommunitiesFilters {
  search: string;
  verified: boolean;
  sort: string;
  dir: "desc" | "asc";
}

const COMMUNITIES_FILTER_SCHEMA: FilterSchema<CommunitiesFilters> = {
  search: { defaultValue: "", paramKey: "search" },
  verified: { defaultValue: false, type: "boolean", paramKey: "verified" },
  sort: {
    defaultValue: "memberCount",
    allowedValues: ["memberCount", "createdAt", "name"] as const,
    paramKey: "sort",
  },
  dir: {
    defaultValue: "desc",
    allowedValues: ["desc", "asc"] as const,
    paramKey: "dir",
  },
};

export default function CommunitiesPage() {
  const { filters, setFilters, setFilter } = useUrlFilters(
    COMMUNITIES_FILTER_SCHEMA,
  );

  const handleCommitSearch = useCallback(
    (val: string) => setFilters({ search: val }),
    [setFilters],
  );
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    filters.search,
    handleCommitSearch,
    350,
  );
  const [isSearchExpanded, setIsSearchExpanded] = useState(
    Boolean(filters.search),
  );

  const sortBy = useMemo(() => {
    return `${filters.sort},${filters.dir}`;
  }, [filters.sort, filters.dir]);

  const queryParams = useMemo(() => {
    return {
      size: 12,
      sort: sortBy,
      search: debouncedSearch || undefined,
      verified: filters.verified ? true : undefined,
    };
  }, [debouncedSearch, filters.verified, sortBy]);

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

  const { ref: loadMoreRef } = useObserver<HTMLDivElement>({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage && !isFetchingNextPage),
    rootMargin: "250px",
  });

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Self-contained Community Header with dialogs */}
      <CommunityHeader />

      {/* Unified Toolbar: Search on left, Toggles + Sort on right */}
      <ExpandableSearch
        value={searchInput}
        onChange={setSearchInput}
        placeholder="Search communities by name..."
        totalCount={totalElements}
        isExpanded={isSearchExpanded}
        onExpandedChange={setIsSearchExpanded}
        breakpoint={540}
        desktopMaxWidth="max-w-md"
        triggerTitle="Search communities"
      >
        <FilterToggle
          label="Verified"
          icon={ShieldCheck}
          checked={filters.verified}
          onCheckedChange={(val) => setFilter("verified", val)}
        />

        <SortSelect
          field={filters.sort}
          dir={filters.dir}
          defaultField="memberCount"
          defaultDir="desc"
          onSortChange={(sort, dir) => setFilters({ sort, dir })}
          options={COMMUNITIES_SORT_OPTIONS}
        />

        {(Boolean(debouncedSearch) ||
          filters.verified ||
          filters.sort !== "memberCount" ||
          filters.dir !== "desc") && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput("");
              setIsSearchExpanded(false);
              setFilters({
                search: "",
                verified: false,
                sort: "memberCount",
                dir: "desc",
              });
            }}
            className="text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0 cursor-pointer"
          >
            Reset
          </Button>
        )}
      </ExpandableSearch>

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
          onClear={() => {
            setSearchInput("");
            setIsSearchExpanded(false);
            setFilters({ search: "" });
          }}
        />
      ) : (
        <div className="@container space-y-6">
          <CommunityGrid communities={allCommunities} />

          {/* Infinite Scroll Sentinel */}
          {hasNextPage && (
            <div
              ref={loadMoreRef}
              className="flex justify-center items-center py-6 min-h-[48px]"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <Spinner className="size-4" />
                  <span>Loading more communities...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
