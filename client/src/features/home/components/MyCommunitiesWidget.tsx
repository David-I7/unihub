import { Link } from "react-router";
import { Users, ArrowRight, Compass } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  useInfiniteCommunities,
  CommunityCard,
  type Community,
} from "@/features/communities";

export function MyCommunitiesWidget() {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteCommunities({ joined: true, size: 6 });

  const communities: Community[] =
    data?.pages.flatMap((page) => page.content) ?? [];

  return (
    <Card className="@container rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-secondary text-foreground/80">
            <Users className="size-4" />
          </div>
          <div>
            <h2 className="font-heading text-base font-bold text-foreground">
              My Communities
            </h2>
            <p className="text-[11px] text-muted-foreground">Enrolled spaces</p>
          </div>
        </div>

        <Link
          to="/communities"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0 group"
        >
          <span>Explore all</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="grid grid-cols-1 @[640px]:grid-cols-2 @[920px]:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl border bg-card p-4 animate-pulse space-y-3"
            >
              <div className="h-16 rounded-xl bg-muted" />
              <div className="h-4 w-3/4 bg-muted rounded-md" />
              <div className="h-3 w-1/2 bg-muted rounded-md" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-6 text-center space-y-2">
          <p className="text-xs text-destructive font-medium">
            Failed to load enrolled communities.
          </p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => refetch()}
            className="cursor-pointer"
          >
            Retry
          </Button>
        </div>
      ) : communities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl border border-dashed border-border/70 bg-muted/10 space-y-3">
          <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Compass className="size-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">
              You haven't joined any communities yet
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              Explore university faculties, cohorts, and student groups to join
              discussions and access course materials.
            </p>
          </div>
          <Link
            to="/communities"
            className={cn(
              buttonVariants({ size: "sm" }),
              "font-semibold cursor-pointer",
            )}
          >
            Explore Communities
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 @[560px]:grid-cols-2 @[920px]:grid-cols-3 gap-4">
            {communities.map((community) => (
              <CommunityCard key={community.id} community={community} />
            ))}
          </div>

          {/* Load More Button */}
          {hasNextPage && (
            <div className="pt-2 pb-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner className="size-3.5" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <span>See more communities</span>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
