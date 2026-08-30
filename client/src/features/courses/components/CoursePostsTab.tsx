import { useMemo } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteCoursePosts } from "@/features/posts/api/getCoursePosts";
import { PostCard } from "@/features/posts/components/PostCard";
import { PostComposerPrompt } from "@/features/posts/components/PostComposerPrompt";
import { usePermissions } from "@/hooks/usePermissions";

interface CoursePostsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

export function CoursePostsTab({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: CoursePostsTabProps) {
  const { canCreatePost } = usePermissions(communitySlug);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteCoursePosts(communitySlug, studyYearSlug, courseSlug, {
    size: 15,
  });

  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Course-level post composer prompt if user is member */}
      {canCreatePost && (
        <PostComposerPrompt
          target={{
            type: "course",
            communitySlug,
            studyYearSlug,
            courseSlug,
          }}
          placeholder="Ask a question about this course, lectures, homework, or exam prep..."
        />
      )}

      {isLoading ? (
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
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load course discussions.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : allPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <MessageSquare className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              No Discussions in this Course Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Ask fellow students questions about homework, course projects, or
              exam tips.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {allPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              communitySlug={communitySlug}
            />
          ))}

          {hasNextPage && (
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
                  "Load More Discussions"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
