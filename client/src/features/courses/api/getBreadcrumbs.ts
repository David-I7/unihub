import client from "@/api/client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export interface BreadcrumbItemDto {
  id: string;
  name: string;
}

export const breadcrumbKeys = {
  all: ["breadcrumbs"] as const,
  folder: (folderId: string) => [...breadcrumbKeys.all, "folder", folderId] as const,
};

export async function getFolderBreadcrumbs(
  folderId: string,
): Promise<BreadcrumbItemDto[]> {
  const response = await client.get<BreadcrumbItemDto[]>(
    `/folders/${folderId}/breadcrumbs`,
  );
  return response.data;
}

export function useFolderBreadcrumbs(
  folderId?: string | null,
  options?: Omit<UseQueryOptions<BreadcrumbItemDto[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: breadcrumbKeys.folder(folderId ?? ""),
    queryFn: () => getFolderBreadcrumbs(folderId!),
    enabled: Boolean(folderId && folderId.trim().length > 0),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
