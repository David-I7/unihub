import client from "@/api/client";
import type { CommunityHome } from "./types";
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { communityKeys } from "./communityKeys";

export async function getCommunityHome(
  communitySlug: string,
): Promise<CommunityHome> {
  const response = await client.get<CommunityHome>(
    `/communities/${communitySlug}/home`,
  );
  return response.data;
}

export function useCommunityHome(communitySlug: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: communityKeys.homeDetail(communitySlug),
    queryFn: async () => {
      const data = await getCommunityHome(communitySlug);
      if (data?.callerMembership !== undefined) {
        queryClient.setQueryData(
          communityKeys.membershipDetail(communitySlug),
          data.callerMembership,
        );
      }
      return data;
    },
    placeholderData: keepPreviousData,
    enabled: communitySlug.length > 0,
  });
}
