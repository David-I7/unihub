import { useMutation } from "@tanstack/react-query";
import type { MessageResponse, RegisterRequest } from "./types";
import client from "@/api/client";

export const register = async (
  registerRequest: RegisterRequest,
): Promise<MessageResponse> => {
  const response = await client.post<MessageResponse>(
    "/auth/register/local",
    registerRequest,
  );
  return response.data;
};

export const useRegister = () => {
  return useMutation<MessageResponse, Error, RegisterRequest>({
    mutationFn: register,
  });
};
