import { useMutation } from "@tanstack/react-query";
import type { ConfirmEmailRequest, MessageResponse } from "../types";
import client from "@/api/client";
import useAuthStore from "../store/useAuthStore";

export const confirmEmail = async (
  request: ConfirmEmailRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>("/auth/confirm-email", request);
  return response.data;
};

export const useConfirmEmail = () => {
  return useMutation<MessageResponse, Error, ConfirmEmailRequest>({
    mutationFn: confirmEmail,
    onSuccess: () => {
      useAuthStore.getState().setEmailVerified(true);
    },
  });
};
