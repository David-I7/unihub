import { useMutation } from "@tanstack/react-query";
import type { ConfirmRegisterRequest, SessionResponse } from "./types";
import client from "@/api/client";
import useAuthStore from "../store/useAuthStore";

export const confirmRegister = async (
  request: ConfirmRegisterRequest,
): Promise<SessionResponse> => {
  const response = await client.post<SessionResponse>(
    "/auth/confirm-register",
    request,
  );
  return response.data;
};

export const useConfirmRegister = () => {
  return useMutation<SessionResponse, Error, ConfirmRegisterRequest>({
    mutationFn: confirmRegister,
    onSuccess: (data) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken);
    },
  });
};
