import { useMutation } from "@tanstack/react-query";
import type { ForgotPasswordRequest, MessageResponse } from "./types";
import client from "@/api/client";

export const forgotPassword = async (
  request: ForgotPasswordRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>(
    "/auth/forgot-password",
    request,
  );
  return response.data;
};

export const useForgotPassword = () => {
  return useMutation<MessageResponse, Error, ForgotPasswordRequest>({
    mutationFn: forgotPassword,
  });
};
