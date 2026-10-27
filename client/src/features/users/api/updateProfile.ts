import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/features/auth/store/useAuthStore";
import { refresh } from "@/features/auth";
import { userKeys } from "./getUserProfile";
import type { UpdateUserProfilePayload, UserProfileResponse } from "./types";

export async function updateProfile(
  payload: UpdateUserProfilePayload,
): Promise<UserProfileResponse> {
  const response = await client.patch<UserProfileResponse>(
    "/users/me",
    payload,
  );
  return response.data;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      useAuthStore.getState().updateUser({ username: data.username });
      try {
        const refreshed = await refresh();
        useAuthStore
          .getState()
          .setAuth(refreshed.user, refreshed.accessToken, false);
      } catch {}
      queryClient.setQueryData(userKeys.me(), data);
    },
  });
}
