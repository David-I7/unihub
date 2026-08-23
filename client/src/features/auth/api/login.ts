import { BASE_URL } from "@/api/client";
import client from "@/api/client";
import type { LoginRequest, RefreshResponse } from "../types";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import queryClient from "@/lib/queryClient";

const BASE_PROVIDER_URL = BASE_URL + "oauth2/authorization/";
export const GOOGLE_LOGIN_URL = BASE_PROVIDER_URL + "google";
export const GITHUB_LOGIN_URL = BASE_PROVIDER_URL + "github";

export const login = async (
  loginRequest: LoginRequest,
): Promise<RefreshResponse> => {
  const response = await client.post("/auth/login/local", loginRequest);
  return response.data;
};

export const useLogin = () => {
  return useMutation<RefreshResponse, Error, LoginRequest>({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
