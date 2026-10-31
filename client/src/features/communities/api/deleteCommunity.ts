import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";
import { userKeys } from "@/features/users/api/getUserProfile";
import { joinCodeKeys } from "./joinCodes";
import { postKeys } from "@/features/posts/api/getCommunityPosts";
import { teacherKeys } from "@/features/teachers/api/keys";

export async function deleteCommunity(communitySlug: string): Promise<void> {
  await client.delete(`/communities/${communitySlug}`);
}

export function useDeleteCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommunity,
    onSuccess: (_res, communitySlug) => {
      queryClient.removeQueries({
        queryKey: communityKeys.homeDetail(communitySlug),
      });
      queryClient.removeQueries({
        queryKey: communityKeys.membershipDetail(communitySlug),
      });
      queryClient.removeQueries({
        queryKey: communityKeys.communityStudyYears(communitySlug),
      });
      queryClient.removeQueries({
        queryKey: postKeys.community(communitySlug),
      });
      queryClient.removeQueries({
        queryKey: teacherKeys.list(communitySlug),
      });
      queryClient.removeQueries({
        queryKey: joinCodeKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.communityInfinities(),
      });
      queryClient.invalidateQueries({
        queryKey: userKeys.communities(),
      });
    },
  });
}
