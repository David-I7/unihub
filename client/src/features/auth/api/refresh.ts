import client from "@/api/client";
import type { RefreshResponse } from "./types";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";

export const refresh = async (): Promise<RefreshResponse> => {
  const response = await client.post("/auth/refresh");
  return response.data;
};

export const useRefresh = () => {
  return useMutation<RefreshResponse, Error>({
    mutationFn: refresh,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
    },
  });
};
