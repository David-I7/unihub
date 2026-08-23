import client from "@/api/client";
import queryClient from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";

export const logout = async (): Promise<void> => {
  await client.post("/auth/logout");
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      useAuthStore.getState().clearAuth();
    },
  });
};
