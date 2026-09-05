import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseMaterialsKeys } from "./getCourseMaterials";

import { rollbackOptimisticContext } from "@/lib/queryCacheUtils";
import { removeCourseMaterialItem } from "./courseMaterialsCache";
import type { CourseMaterialsResponse } from "./types";

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
    onMutate: async ({ materialId }) => {
      await queryClient.cancelQueries({ queryKey: courseMaterialsKeys.all });
      const previousQueries = queryClient.getQueriesData<CourseMaterialsResponse>({
        queryKey: courseMaterialsKeys.all,
      });

      removeCourseMaterialItem(queryClient, courseMaterialsKeys.all, materialId);

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
