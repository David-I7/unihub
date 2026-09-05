import { MessageSquare, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "./PostCard";
import { useObserver } from "@/hooks/useObserver";
import type { Post } from "../api/types";
import type { CallerMembership } from "@/features/communities/api/types";

export interface PostsFeedProps {
  posts: Post[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage: () => void;
  onRetry: () => void;
  canCreatePost?: boolean;
  onOpenComposer: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  communitySlug?: string;
  callerMembership?: CallerMembership | null;
  isArchived?: boolean;
}

export function PostsFeed({
  posts,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage,
  onRetry,
  canCreatePost = false,
  onOpenComposer,
  emptyTitle = "No Discussions Yet",
  emptyDescription = "Be the first to start an academic discussion or share materials.",
  communitySlug,
  callerMembership,
  isArchived = false,
}: PostsFeedProps) {
  const { ref: sentinelRef } = useObserver<HTMLDivElement>({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        onFetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage && !isFetchingNextPage),
    rootMargin: "300px",
  });

  return (
    <div className="space-y-4 w-full">
      {/* Top Action Row: New Post button if authorized */}
      {canCreatePost && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={onOpenComposer}
            className="gap-1.5 font-semibold cursor-pointer"
          >
            <Plus className="size-4" />
            <span>New Post</span>
          </Button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-xl" />
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
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load discussions.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MessageSquare className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {emptyTitle}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {emptyDescription}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              communitySlug={communitySlug}
              callerMembership={callerMembership}
              isArchived={isArchived}
            />
          ))}

          {/* Infinite Scroll Sentinel */}
          {hasNextPage && (
            <div
              ref={sentinelRef}
              className="h-4 w-full flex justify-center py-2"
            >
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner className="size-4" />
                  <span>Loading more discussions...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
