import { useCallback } from "react";
import { useAuthStore } from "@/features/auth";
import { useUserProfile } from "@/features/users/api/getUserProfile";
import { PERMISSIONS, checkPermission } from "@/lib/permissions";
import type {
  CallerMembership,
  CommunityMemberRole,
} from "@/features/communities/api/types";

export function usePermissions(
  target?: string | CallerMembership | null,
  targetMembership?: CallerMembership | null,
) {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useUserProfile({ enabled: Boolean(user) });

  let callerMembership: CallerMembership | null | undefined;

  if (typeof target === "string") {
    callerMembership = targetMembership;
  } else {
    callerMembership = target;
  }

  const globalPermissions = profile?.permissions ?? [];

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
    canCreateStudyYear,
    canDeleteStudyYear,
    canCreatePost,
    canPinPost,
    canCreateComment,
    canEditPost,
    canDeletePost,
    canEditComment,
    canDeleteComment,
  };
}
