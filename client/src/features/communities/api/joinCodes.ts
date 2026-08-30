import client from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CommunityJoinCode,
  CommunityJoinPreviewResponse,
  CreateJoinCodeDto,
  UpdateJoinCodeDto,
} from "./types";

export const joinCodeKeys = {
  all: ["joinCodes"] as const,
  list: (communitySlug: string) =>
    [...joinCodeKeys.all, communitySlug] as const,
  preview: (communitySlug: string, code: string) =>
    [...joinCodeKeys.all, "preview", communitySlug, code] as const,
};

export async function getJoinCodePreview(
  communitySlug: string,
  code: string,
): Promise<CommunityJoinPreviewResponse> {
  const response = await client.get<CommunityJoinPreviewResponse>(
    `/communities/${communitySlug}/join-codes/preview`,
    { params: { code } },
  );
  return response.data;
}

export function useJoinCodePreview(
  communitySlug: string,
  code: string,
  enabled = true,
) {
  return useQuery({
    queryKey: joinCodeKeys.preview(communitySlug, code),
    queryFn: () => getJoinCodePreview(communitySlug, code),
    enabled: enabled && communitySlug.length > 0 && code.length > 0,
    retry: false,
  });
}

export async function getJoinCodes(
  communitySlug: string,
): Promise<CommunityJoinCode[]> {
  const response = await client.get<CommunityJoinCode[]>(
    `/communities/${communitySlug}/join-codes`,
  );
  return response.data;
}

export function useJoinCodes(communitySlug: string, enabled = true) {
  return useQuery({
    queryKey: joinCodeKeys.list(communitySlug),
    queryFn: () => getJoinCodes(communitySlug),
    enabled: enabled && communitySlug.length > 0,
  });
}

export interface CreateJoinCodeVariables {
  communitySlug: string;
  payload: CreateJoinCodeDto;
}

export async function createJoinCode({
  communitySlug,
  payload,
}: CreateJoinCodeVariables): Promise<CommunityJoinCode> {
  const response = await client.post<CommunityJoinCode>(
    `/communities/${communitySlug}/join-codes`,
    payload,
  );
  return response.data;
}

export function useCreateJoinCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJoinCode,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: joinCodeKeys.list(variables.communitySlug),
      });
    },
  });
}

export interface UpdateJoinCodeVariables {
  communitySlug: string;
  codeId: string;
  payload: UpdateJoinCodeDto;
}

export async function updateJoinCode({
  communitySlug,
  codeId,
  payload,
}: UpdateJoinCodeVariables): Promise<CommunityJoinCode> {
  const response = await client.patch<CommunityJoinCode>(
    `/communities/${communitySlug}/join-codes/${codeId}`,
    payload,
  );
  return response.data;
}

export function useUpdateJoinCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateJoinCode,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: joinCodeKeys.list(variables.communitySlug),
      });
    },
  });
}

export interface DeleteJoinCodeVariables {
  communitySlug: string;
  codeId: string;
}

export async function deleteJoinCode({
  communitySlug,
  codeId,
}: DeleteJoinCodeVariables): Promise<void> {
  await client.delete(`/communities/${communitySlug}/join-codes/${codeId}`);
}

export function useDeleteJoinCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteJoinCode,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: joinCodeKeys.list(variables.communitySlug),
      });
    },
  });
}
