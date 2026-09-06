import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "@/features/auth/store/useAuthStore";
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
    onSuccess: (data) => {
      useAuthStore.getState().updateUser({ username: data.username });
      queryClient.setQueryData(userKeys.me(), data);
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
