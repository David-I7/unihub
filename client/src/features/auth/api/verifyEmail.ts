import { useMutation } from "@tanstack/react-query";
import type { MessageResponse, VerifyEmailRequest } from "./types";
import client from "@/api/client";

export const verifyEmail = async (
  request: VerifyEmailRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>(
    "/auth/verify-email",
    request,
  );
  return response.data;
};

export const useVerifyEmail = () => {
  return useMutation<MessageResponse, Error, VerifyEmailRequest>({
    mutationFn: verifyEmail,
  });
};
