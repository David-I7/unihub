import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/features/auth";
import { useUserProfile } from "@/features/users/api/getUserProfile";
import { PERMISSIONS, checkPermission } from "@/lib/permissions";
import type {
  CallerMembership,
  CommunityMemberRole,
} from "@/features/communities/api/types";

import { useCommunityHome } from "@/features/communities/api/getCommunityHome";

export function usePermissions(
  target?: string | CallerMembership | null,
  targetMembership?: CallerMembership | null,
) {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useUserProfile({ enabled: Boolean(user) });

  const communitySlug = typeof target === "string" ? target : "";
  const { data: communityHome } = useCommunityHome(communitySlug);

  let callerMembership: CallerMembership | null | undefined;

  if (typeof target === "string") {
    callerMembership = targetMembership ?? communityHome?.callerMembership ?? null;
  } else {
    callerMembership = target;
  }

  const globalPermissions = useMemo(
    () => profile?.permissions ?? [],
    [profile?.permissions],
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return checkPermission(permission, {
        globalPermissions,
        callerMembership,
      });
    },
    [globalPermissions, callerMembership],
  );

  const isMember = Boolean(callerMembership?.isMember);
  const communityRole: CommunityMemberRole | null =
    callerMembership?.role ?? null;
  const isOwner = communityRole === "COMMUNITY_OWNER";

  const canCreateCommunity = hasPermission(PERMISSIONS.CREATE_COMMUNITY);
  const canEditCommunity = hasPermission(PERMISSIONS.UPDATE_COMMUNITY);
  const canDeleteCommunity = hasPermission(PERMISSIONS.DELETE_COMMUNITY);
  const canVerifyCommunity = hasPermission(PERMISSIONS.VERIFY_COMMUNITY);
  const canManageJoinCodes =
    hasPermission(PERMISSIONS.CREATE_JOIN_CODE) ||
    hasPermission(PERMISSIONS.UPDATE_JOIN_CODE);

  const canAddMember = hasPermission(PERMISSIONS.CREATE_MEMBER);
  const canRemoveMember = hasPermission(PERMISSIONS.DELETE_MEMBER);
  const canUpdateMemberRole = hasPermission(PERMISSIONS.UPDATE_MEMBER_ROLE);

  const canCreateStudyYear = hasPermission(PERMISSIONS.CREATE_STUDY_YEAR);
  const canDeleteStudyYear = hasPermission(PERMISSIONS.DELETE_STUDY_YEAR);

  const canCreatePost = hasPermission(PERMISSIONS.CREATE_POST);
  const canPinPost = hasPermission(PERMISSIONS.PIN_POST);
  const canCreateComment = hasPermission(PERMISSIONS.CREATE_COMMENT);

  const canEditPost = useCallback(
    (postOwnerId: string) => {
      if (user && postOwnerId && String(user.id) === String(postOwnerId)) {
        return true;
      }
      return hasPermission(PERMISSIONS.UPDATE_POST);
    },
    [user, hasPermission],
  );

  const canDeletePost = useCallback(
    (postOwnerId: string) => {
      if (user && postOwnerId && String(user.id) === String(postOwnerId)) {
        return true;
      }
      return (
        hasPermission(PERMISSIONS.DELETE_POST) ||
        hasPermission(PERMISSIONS.MODERATE_POST)
      );
    },
    [user, hasPermission],
  );

  const canEditComment = useCallback(
    (commentOwnerId: string) => {
      if (user && commentOwnerId && String(user.id) === String(commentOwnerId)) {
        return true;
      }
      return hasPermission(PERMISSIONS.UPDATE_COMMENT);
    },
    [user, hasPermission],
  );

  const canDeleteComment = useCallback(
    (commentOwnerId: string) => {
      if (user && commentOwnerId && String(user.id) === String(commentOwnerId)) {
        return true;
      }
      return (
        hasPermission(PERMISSIONS.DELETE_COMMENT) ||
        hasPermission(PERMISSIONS.MODERATE_COMMENT)
      );
    },
    [user, hasPermission],
  );

  const canCreateFolder = hasPermission(PERMISSIONS.CREATE_FOLDER);
  const canCreateMaterial = hasPermission(PERMISSIONS.CREATE_MATERIAL);

  const canEditFolder = useCallback(
    (folderOwnerId?: string | number | null) => {
      if (user && folderOwnerId && String(user.id) === String(folderOwnerId)) {
        return true;
      }
      return false;
    },
    [user],
  );

  const canDeleteFolder = useCallback(
    (folderOwnerId?: string | number | null) => {
      if (user && folderOwnerId && String(user.id) === String(folderOwnerId)) {
        return true;
      }
      return hasPermission(PERMISSIONS.MODERATE_FOLDER);
    },
    [user, hasPermission],
  );

  const canEditMaterial = useCallback(
    (materialOwnerId?: string | number | null) => {
      if (user && materialOwnerId && String(user.id) === String(materialOwnerId)) {
        return true;
      }
      return false;
    },
    [user],
  );

  const canDeleteMaterial = useCallback(
    (materialOwnerId?: string | number | null) => {
      if (user && materialOwnerId && String(user.id) === String(materialOwnerId)) {
        return true;
      }
      return hasPermission(PERMISSIONS.MODERATE_MATERIAL);
    },
    [user, hasPermission],
  );

  return {
    user,
    isMember,
    isOwner,
    communityRole,
    globalPermissions,
    hasPermission,
    canCreateCommunity,
    canEditCommunity,
    canDeleteCommunity,
    canVerifyCommunity,
    canManageJoinCodes,
    canAddMember,
    canRemoveMember,
    canUpdateMemberRole,
    canCreateStudyYear,
    canDeleteStudyYear,
    canCreatePost,
    canPinPost,
    canCreateComment,
    canEditPost,
    canDeletePost,
    canEditComment,
    canDeleteComment,
    canCreateFolder,
    canCreateMaterial,
    canEditFolder,
    canDeleteFolder,
    canEditMaterial,
    canDeleteMaterial,
  };
}

