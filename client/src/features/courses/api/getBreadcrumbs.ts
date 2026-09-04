import client from "@/api/client";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export interface BreadcrumbItemDto {
  id: string;
  name: string;
  type: "FOLDER" | "FILE" | "LINK";
}

export const breadcrumbKeys = {
  all: ["breadcrumbs"] as const,
  folder: (folderId: string) => [...breadcrumbKeys.all, "folder", folderId] as const,
  material: (materialId: string) => [...breadcrumbKeys.all, "material", materialId] as const,
};

export async function getFolderBreadcrumbs(
  folderId: string,
): Promise<BreadcrumbItemDto[]> {
  const response = await client.get<BreadcrumbItemDto[]>(
    `/folders/${folderId}/breadcrumbs`,
  );
  return response.data;
}

export async function getMaterialBreadcrumbs(
  materialId: string,
): Promise<BreadcrumbItemDto[]> {
  const response = await client.get<BreadcrumbItemDto[]>(
    `/materials/${materialId}/breadcrumbs`,
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

export function useMaterialBreadcrumbs(
  materialId?: string | null,
  options?: Omit<UseQueryOptions<BreadcrumbItemDto[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: breadcrumbKeys.material(materialId ?? ""),
    queryFn: () => getMaterialBreadcrumbs(materialId!),
    enabled: Boolean(materialId && materialId.trim().length > 0),
    staleTime: 1000 * 60 * 10,
    ...options,
  });
}
