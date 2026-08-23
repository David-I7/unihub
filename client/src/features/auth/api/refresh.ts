import client from "@/api/client";
import type { RefreshResponse } from "../types";

export const refresh = async (): Promise<RefreshResponse> => {
  const response = await client.post("/auth/refresh");
  return response.data;
};
