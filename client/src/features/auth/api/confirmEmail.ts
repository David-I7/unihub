import { useMutation } from "@tanstack/react-query";
import type { ConfirmEmailRequest, MessageResponse } from "./types";
import client from "@/api/client";
import useAuthStore from "../store/useAuthStore";
import { refresh } from "./refresh";

export const confirmEmail = async (
  request: ConfirmEmailRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>(
    "/auth/confirm-email",
    request,
  );
  return response.data;
};

export const useConfirmEmail = () => {
  return useMutation<MessageResponse, Error, ConfirmEmailRequest>({
    mutationFn: confirmEmail,
    onSuccess: async () => {
      useAuthStore.getState().setEmailVerified(true);
      try {
        const data = await refresh();
        useAuthStore.getState().setAuth(data.user, data.accessToken);
      } catch {}
    },
  });
};
