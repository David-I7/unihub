import { useState, useMemo } from "react";
import { useInfiniteCoursePosts } from "@/features/posts/api/getCoursePosts";
import { PostsFeed, PostComposerModal } from "@/features/posts";
import { usePermissions } from "@/hooks/usePermissions";

interface CoursePostsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  isArchived?: boolean;
}

export function CoursePostsTab({
  communitySlug,
  studyYearSlug,
  courseSlug,
  isArchived = false,
}: CoursePostsTabProps) {
  const [composerOpen, setComposerOpen] = useState(false);
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
    <>
      <PostsFeed
        posts={allPosts}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        onFetchNextPage={fetchNextPage}
        onRetry={() => refetch()}
        canCreatePost={!isArchived && canCreatePost}
        onOpenComposer={() => setComposerOpen(true)}
        emptyTitle="No Discussions in this Course Yet"
        emptyDescription={
          isArchived
            ? "No discussions were recorded before this course was archived."
            : "Be the first to start an academic discussion or ask a question about this course."
        }
      />

      {!isArchived && (
        <PostComposerModal
          target={{
            type: "course",
            communitySlug,
            studyYearSlug,
            courseSlug,
          }}
          open={composerOpen}
          onOpenChange={setComposerOpen}
        />
      )}
    </>
  );
}
