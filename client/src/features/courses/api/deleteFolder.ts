import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseMaterialsKeys } from "./getCourseMaterials";

import { rollbackOptimisticContext } from "@/lib/queryCacheUtils";
import { removeCourseMaterialItem } from "./courseMaterialsCache";
import type { CourseMaterialsResponse } from "./types";

export interface DeleteFolderVariables {
  folderId: string;
}

export async function deleteFolder({
  folderId,
}: DeleteFolderVariables): Promise<void> {
  await client.delete(`/folders/${folderId}`);
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFolder,
    onMutate: async ({ folderId }) => {
      await queryClient.cancelQueries({ queryKey: courseMaterialsKeys.all });
      const previousQueries = queryClient.getQueriesData<CourseMaterialsResponse>({
        queryKey: courseMaterialsKeys.all,
      });

      removeCourseMaterialItem(queryClient, courseMaterialsKeys.all, folderId);

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      rollbackOptimisticContext(queryClient, context);
    },
  });
}
