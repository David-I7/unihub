import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseMaterialFolder, UpdateFolderPayload } from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

import {
  updateCourseMaterialItem,
  rollbackOptimisticContext,
  type CourseMaterialsCacheData,
} from "@/lib/queryCacheUtils";

export interface UpdateFolderVariables {
  folderId: string;
  payload: UpdateFolderPayload;
}

export async function updateFolder({
  folderId,
  payload,
}: UpdateFolderVariables): Promise<CourseMaterialFolder> {
  const response = await client.patch<CourseMaterialFolder>(
    `/folders/${folderId}`,
    payload,
  );
  return response.data;
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFolder,
    onMutate: async ({ folderId, payload }) => {
      await queryClient.cancelQueries({ queryKey: courseMaterialsKeys.all });
      const previousQueries = queryClient.getQueriesData<CourseMaterialsCacheData>({
        queryKey: courseMaterialsKeys.all,
      });

      updateCourseMaterialItem<CourseMaterialFolder>(
        queryClient,
        courseMaterialsKeys.all,
        folderId,
        (folder) => ({ ...folder, ...payload }),
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
    onSuccess: (updatedFolder) => {
      updateCourseMaterialItem<CourseMaterialFolder>(
        queryClient,
        courseMaterialsKeys.all,
        updatedFolder.id,
        () => updatedFolder,
      );
    },
  });
}
