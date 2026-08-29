import { useMutation } from "@tanstack/react-query";
import type { MessageResponse, ResetPasswordRequest } from "../types";
import client from "@/api/client";

export const resetPassword = async (
  request: ResetPasswordRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>("/auth/reset-password", request);
  return response.data;
};

export const useResetPassword = () => {
  return useMutation<MessageResponse, Error, ResetPasswordRequest>({
    mutationFn: resetPassword,
  });
};
