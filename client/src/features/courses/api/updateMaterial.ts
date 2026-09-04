import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseMaterialFile, CourseMaterialLink, UpdateMaterialPayload } from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

import {
  updateCourseMaterialItem,
  rollbackOptimisticContext,
  type CourseMaterialsCacheData,
} from "@/lib/queryCacheUtils";

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
    onMutate: async ({ materialId, payload }) => {
      await queryClient.cancelQueries({ queryKey: courseMaterialsKeys.all });
      const previousQueries = queryClient.getQueriesData<CourseMaterialsCacheData>({
        queryKey: courseMaterialsKeys.all,
      });

      updateCourseMaterialItem<CourseMaterialFile | CourseMaterialLink>(
        queryClient,
        courseMaterialsKeys.all,
        materialId,
        (material) => ({ ...material, ...payload }),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
    onSuccess: (updatedMaterial) => {
      updateCourseMaterialItem<CourseMaterialFile | CourseMaterialLink>(
        queryClient,
        courseMaterialsKeys.all,
        updatedMaterial.id,
        () => updatedMaterial,
      );
    },
  });
}
