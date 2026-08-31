import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseMaterialsKeys } from "./getCourseMaterials";

export interface DeleteMaterialVariables {
  materialId: string;
}

export async function deleteMaterial({
  materialId,
}: DeleteMaterialVariables): Promise<void> {
  await client.delete(`/materials/${materialId}`);
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });
    },
  });
}
