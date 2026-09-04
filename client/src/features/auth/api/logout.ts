import client from "@/api/client";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router";
import queryClient from "@/lib/queryClient";

export const logout = async (): Promise<void> => {
  await client.post("/auth/logout");
};

export const useLogout = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      navigate("/");
    },
  });
};
