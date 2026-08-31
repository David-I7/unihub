import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { courseMaterialsKeys } from "./getCourseMaterials";

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });
    },
  });
}
