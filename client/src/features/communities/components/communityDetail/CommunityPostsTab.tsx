import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/components/app/PostCard";
import { useInfiniteCommunityPosts } from "../../api/getCommunityPosts";
import { MOCK_COMMUNITY_POSTS } from "./mockCommunityPosts";

/**
 * Temporary toggle for UI preview.
 * Set to false or remove once the backend posts endpoint is active.
 */
const USE_MOCK_POSTS = true;

interface CommunityPostsTabProps {
  communitySlug: string;
}

export function CommunityPostsTab({ communitySlug }: CommunityPostsTabProps) {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteCommunityPosts(communitySlug, { size: 10 });

  const allPosts = useMemo(() => {
    const apiPosts = data?.pages.flatMap((page) => page.content) ?? [];
    if (USE_MOCK_POSTS && apiPosts.length === 0) {
      return MOCK_COMMUNITY_POSTS;
    }
    return apiPosts;
  }, [data]);

  if (isLoading && !USE_MOCK_POSTS) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (isError && !USE_MOCK_POSTS) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
        <p className="text-sm font-semibold text-destructive">
          Failed to load community posts.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <MessageSquare className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground">
            No Posts Yet
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Be the first to start a discussion or share materials in this
            community.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && !USE_MOCK_POSTS && (
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
                <Spinner className="size-4" /> Loading more posts...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
