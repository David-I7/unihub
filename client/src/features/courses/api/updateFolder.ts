import client from "@/api/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CourseMaterialFolder, UpdateFolderPayload } from "./types";
import { courseMaterialsKeys } from "./getCourseMaterials";

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });
    },
  });
}
