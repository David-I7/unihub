import { useMutation } from "@tanstack/react-query";
import type { MessageResponse } from "./types";
import client from "@/api/client";

export interface ResendEmailVerificationRequest {
  email: string;
}

export const resendEmailVerification = async (
  request: ResendEmailVerificationRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>(
    "/auth/verify-email/resend-code",
    request,
  );
  return response.data;
};

export const useResendEmailVerification = () => {
  return useMutation<MessageResponse, Error, ResendEmailVerificationRequest>({
    mutationFn: resendEmailVerification,
  });
};
