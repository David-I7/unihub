import { useState, useMemo } from "react";
import { useInfiniteCommunityPosts } from "@/features/posts/api/getCommunityPosts";
import { PostsFeed, PostComposerModal } from "@/features/posts";
import { usePermissions } from "@/hooks/usePermissions";
import type { CallerMembership } from "../../api/types";

interface CommunityPostsTabProps {
  communitySlug: string;
  callerMembership?: CallerMembership | null;
}

export function CommunityPostsTab({
  communitySlug,
  callerMembership,
}: CommunityPostsTabProps) {
  const [composerOpen, setComposerOpen] = useState(false);
  const { canCreatePost } = usePermissions(callerMembership);

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteCommunityPosts(communitySlug, { size: 15 });

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
        canCreatePost={canCreatePost}
        onOpenComposer={() => setComposerOpen(true)}
        emptyTitle="No Discussions Yet"
        emptyDescription="Be the first to start an academic discussion or share materials in this community."
      />

      <PostComposerModal
        target={{ type: "community", communitySlug }}
        open={composerOpen}
        onOpenChange={setComposerOpen}
      />
    </>
  );
}
