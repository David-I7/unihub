import { useMutation } from "@tanstack/react-query";
import client from "@/api/client";
import useAuthStore from "@/features/auth/store/useAuthStore";
import queryClient from "@/lib/queryClient";

export const deleteAccount = async (): Promise<void> => {
  await client.delete("/users/me");
};

export const useDeleteAccount = () => {
  return useMutation<void, Error, void>({
    mutationFn: deleteAccount,
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      queryClient.clear();
    },
  });
};
