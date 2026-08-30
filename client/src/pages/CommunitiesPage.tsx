import { useState, useMemo, useCallback } from "react";
import {
  useInfiniteCommunities,
  CommunityHeader,
  CommunitySearch,
  CommunityGrid,
  CommunityGridSkeleton,
  CommunityEmptyState,
} from "@/features/communities";
import { ErrorStateCard } from "@/components/app/ErrorStateCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  ShieldCheck,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from "lucide-react";
import { debounce } from "@/lib/performanceUtils";
import { useObserver } from "@/hooks/useObserver";

const SORT_FIELD_OPTIONS = [
  { value: "memberCount", label: "Member Count" },
  { value: "createdAt", label: "Creation Date" },
  { value: "name", label: "Name" },
] as const;

const SORT_FIELD_LABELS: Record<string, string> = {
  memberCount: "Member Count",
  createdAt: "Creation Date",
  name: "Name",
};

export default function CommunitiesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortField, setSortField] = useState<string>("memberCount");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

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

  const sortBy = useMemo(() => {
    return `${sortField},${sortDirection}`;
  }, [sortField, sortDirection]);

  const queryParams = useMemo(() => {
    return {
      size: 12,
      sort: sortBy,
      search: debouncedSearch || undefined,
      verified: verifiedOnly ? true : undefined,
    };
  }, [debouncedSearch, verifiedOnly, sortBy]);

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
      {/* Self-contained, memoized Community Header with dialogs */}
      <CommunityHeader />

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
          {/* Verified Toggle Filter */}
          <Button
            type="button"
            variant={verifiedOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setVerifiedOnly((prev) => !prev)}
            className="h-9 gap-1.5 text-xs font-normal rounded-xl cursor-pointer"
          >
            <ShieldCheck
              className={`size-3.5 ${
                verifiedOnly ? "text-emerald-500" : "text-muted-foreground"
              }`}
            />
            <span className="font-normal">Verified</span>
            {verifiedOnly && <Check className="size-3 text-emerald-500 ml-0.5" />}
          </Button>

          {/* Sort By Field Dropdown */}
          <Select
            value={sortField}
            onValueChange={(val) => {
              if (val) setSortField(val);
            }}
          >
            <SelectTrigger className="h-9 w-[150px] text-xs font-normal rounded-xl">
              <SelectValue placeholder="Sort by">
                {SORT_FIELD_LABELS[sortField] ?? "Sort by"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SORT_FIELD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Direction Toggle Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="h-9 gap-1.5 text-xs font-normal rounded-xl cursor-pointer"
            title={`Sort Direction: ${sortDirection === "desc" ? "Descending" : "Ascending"}`}
          >
            {sortDirection === "desc" ? (
              <>
                <ArrowDownWideNarrow className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-normal">
                  {sortField === "name"
                    ? "Z → A"
                    : sortField === "createdAt"
                      ? "Newest"
                      : "High → Low"}
                </span>
              </>
            ) : (
              <>
                <ArrowUpNarrowWide className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-normal">
                  {sortField === "name"
                    ? "A → Z"
                    : sortField === "createdAt"
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
          onClear={() => handleSearchChange("")}
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
