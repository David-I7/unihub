import { useMutation } from "@tanstack/react-query";
import type { MessageResponse } from "./types";
import client from "@/api/client";

export interface ResendRegisterCodeRequest {
  email: string;
}

export const resendRegisterCode = async (
  request: ResendRegisterCodeRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>(
    "/auth/register/resend-code",
    request,
  );
  return response.data;
};

export const useResendRegisterCode = () => {
  return useMutation<MessageResponse, Error, ResendRegisterCodeRequest>({
    mutationFn: resendRegisterCode,
  });
};
