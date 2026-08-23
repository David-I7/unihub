import { useMutation } from "@tanstack/react-query";
import type { RefreshResponse, RegisterRequest } from "../types";
import client from "@/api/client";
import useAuthStore from "../store/useAuthStore";
import queryClient from "@/lib/queryClient";

export const register = async (
  registerRequest: RegisterRequest,
): Promise<RefreshResponse> => {
  const response = await client.post("/auth/register/local", registerRequest);
  return response.data;
};

export const useRegister = () => {
  return useMutation<RefreshResponse, Error, RegisterRequest>({
    mutationFn: register,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
