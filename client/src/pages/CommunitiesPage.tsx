import { useMemo, useCallback } from "react";
import {
  useInfiniteCommunities,
  CommunityHeader,
  CommunityGrid,
  CommunityGridSkeleton,
  CommunityEmptyState,
} from "@/features/communities";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { SearchInput } from "@/components/app/SearchInput";
import { FilterSelect } from "@/components/app/FilterSelect";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "@/components/ui/icons";
import { useObserver } from "@/hooks/useObserver";
import {
  useUrlFilters,
  useDebouncedInput,
  type FilterSchema,
} from "@/hooks/useUrlFilters";

const SORT_FIELD_OPTIONS = [
  { value: "memberCount", label: "Member Count" },
  { value: "createdAt", label: "Creation Date" },
  { value: "name", label: "Name" },
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

      {/* 2-tier Toolbar: Search Bar on Top, Filter Row below */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-xl">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search communities by name..."
              totalCount={totalElements}
            />
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {/* Verified Toggle Filter */}
          <Button
            type="button"
            variant={filters.verified ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter("verified", !filters.verified)}
            className="h-9 gap-1.5 text-xs font-normal rounded-xl cursor-pointer"
          >
            <ShieldCheck
              className={`size-3.5 ${
                filters.verified ? "text-emerald-500" : "text-muted-foreground"
              }`}
            />
            <span>Verified Only</span>
            {filters.verified && (
              <Check className="size-3 text-emerald-500 ml-0.5" />
            )}
          </Button>

          {/* Sort By Filter */}
          <FilterSelect
            label="Sort by"
            value={filters.sort}
            onChange={(val) => setFilter("sort", val)}
            options={SORT_FIELD_OPTIONS}
          />

          {/* Sort Direction Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFilter("dir", filters.dir === "asc" ? "desc" : "asc")
            }
            className="h-9 gap-1.5 text-xs font-normal rounded-xl cursor-pointer"
            title={`Sort Direction: ${filters.dir === "desc" ? "Descending" : "Ascending"}`}
          >
            {filters.dir === "desc" ? (
              <>
                <ChevronDown className="size-3.5 text-muted-foreground" />
                <span className="text-xs">
                  {filters.sort === "name"
                    ? "Z → A"
                    : filters.sort === "createdAt"
                      ? "Newest"
                      : "High → Low"}
                </span>
              </>
            ) : (
              <>
                <ChevronUp className="size-3.5 text-muted-foreground" />
                <span className="text-xs">
                  {filters.sort === "name"
                    ? "A → Z"
                    : filters.sort === "createdAt"
                      ? "Oldest"
                      : "Low → High"}
                </span>
              </>
            )}
          </Button>
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
          onClear={() => {
            setSearchInput("");
            setFilters({ search: "" });
          }}
        />
      ) : (
        <div className="space-y-6">
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
