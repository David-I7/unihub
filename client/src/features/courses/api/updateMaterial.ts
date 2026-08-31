import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseMaterialFile, CourseMaterialLink, UpdateMaterialPayload } from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

export interface UpdateMaterialVariables {
  materialId: string;
  payload: UpdateMaterialPayload;
}

export async function updateMaterial({
  materialId,
  payload,
}: UpdateMaterialVariables): Promise<CourseMaterialFile | CourseMaterialLink> {
  const response = await client.patch<CourseMaterialFile | CourseMaterialLink>(
    `/materials/${materialId}`,
    payload,
  );
  return response.data;
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });
    },
  });
}
