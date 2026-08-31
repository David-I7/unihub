import client from "@/api/client";
import type { DownloadUrlResponse } from "./types";

export async function getMaterialDownloadUrl(
  materialId: string,
): Promise<DownloadUrlResponse> {
  const response = await client.get<DownloadUrlResponse>(
    `/materials/${materialId}/download-url`,
  );
  return response.data;
}
