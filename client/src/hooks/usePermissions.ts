import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/features/auth";
import { useUserProfile } from "@/features/users/api/getUserProfile";
import { PERMISSIONS, checkPermission } from "@/lib/permissions";
import type {
  CallerMembership,
  Comment,
  CommunityMember,
  CommunityMemberRole,
  Post,
} from "@/features/communities/api/types";

import { useCommunityMembership } from "@/features/communities/api/getCommunityMembership";
import type { TeacherRating } from "@/features/teachers/api/types";

export function usePermissions(target?: string | CallerMembership | null) {
  const user = useAuthStore((state) => state.user);
  const { data: profile } = useUserProfile({ enabled: Boolean(user) });

  const communitySlug = typeof target === "string" ? target : "";
  const shouldFetchMembership =
    typeof target === "string" && Boolean(user) && communitySlug.length > 0;

  const { data: membershipData } = useCommunityMembership(communitySlug, {
    enabled: shouldFetchMembership,
  });

  let callerMembership: CallerMembership | null | undefined;

  if (typeof target === "string") {
    callerMembership = membershipData ?? null;
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
  const isPlatformAdmin = user?.role === "ADMIN" || user?.role === "ROOT";
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
  const canRemoveMember = (member: CommunityMember) => {
    if (isPlatformAdmin) {
      return member.role !== "COMMUNITY_OWNER";
    }

    const hasHigherRoleThanTarget =
      (callerMembership?.role === "COMMUNITY_OWNER" &&
        member.role !== "COMMUNITY_OWNER") ||
      (callerMembership?.role === "COMMUNITY_ADMIN" &&
        member.role === "COMMUNITY_MEMBER");
    return hasPermission(PERMISSIONS.DELETE_MEMBER) && hasHigherRoleThanTarget;
  };
  const canUpdateMemberRole = (member: CommunityMember) => {
    if (member.userId === null) return false;

    if (isPlatformAdmin) {
      return member.role !== "COMMUNITY_OWNER";
    }

    const isSelf = member.userId === user?.id;
    const hasHigherRoleThanTarget =
      (callerMembership?.role === "COMMUNITY_OWNER" &&
        member.role !== "COMMUNITY_OWNER") ||
      (callerMembership?.role === "COMMUNITY_ADMIN" &&
        member.role === "COMMUNITY_MEMBER");
    return (
      hasPermission(PERMISSIONS.UPDATE_MEMBER_ROLE) &&
      !isSelf &&
      hasHigherRoleThanTarget
    );
  };

  const canCreateStudyYear = hasPermission(PERMISSIONS.CREATE_STUDY_YEAR);
  const canDeleteStudyYear = hasPermission(PERMISSIONS.DELETE_STUDY_YEAR);

  const canCreateCourse = hasPermission(PERMISSIONS.CREATE_COURSE);
  const canEditCourse = hasPermission(PERMISSIONS.UPDATE_COURSE);
  const canDeleteCourse = hasPermission(PERMISSIONS.DELETE_COURSE);
  const canArchiveCourse = hasPermission(PERMISSIONS.ARCHIVE_COURSE);

  const canCreatePost = hasPermission(PERMISSIONS.CREATE_POST);
  const canPinPost = hasPermission(PERMISSIONS.PIN_POST);
  const canCreateComment = hasPermission(PERMISSIONS.CREATE_COMMENT);

  const canCreateTeacher = hasPermission(PERMISSIONS.CREATE_TEACHER);
  const canUpdateTeacher = hasPermission(PERMISSIONS.UPDATE_TEACHER);
  const canDeleteTeacher = hasPermission(PERMISSIONS.DELETE_TEACHER);

  const canCreateTeacherRating = hasPermission(
    PERMISSIONS.CREATE_TEACHER_RATING,
  );
  const canUpdateTeacherRating = useCallback(
    (review: TeacherRating) => {
      if (
        user &&
        review.author &&
        String(user.id) === String(review.author.id)
      ) {
        return (
          new Date(review.createdAt).getTime() <
          new Date().getTime() - 30 * 60 * 1000
        );
      }
      return false;
    },
    [user, hasPermission],
  );
  const canDeleteTeacherRating = useCallback(
    (reviewOwnerId: string) => {
      if (user && reviewOwnerId && String(user.id) === String(reviewOwnerId)) {
        return true;
      }
      return hasPermission(PERMISSIONS.MODERATE_TEACHER_RATING);
    },
    [user, hasPermission],
  );

  const canEditPost = useCallback(
    (post: Post) => {
      if (user && post.owner && post.owner.id === user.id) {
        return (
          new Date(post.createdAt).getTime() <
          new Date().getTime() - 30 * 60 * 1000
        ); // Allow editing within 30 minutes of creation
      }
      return false;
    },
    [user, hasPermission],
  );

  const canDeletePost = useCallback(
    (postOwnerId?: string | null) => {
      if (user && postOwnerId && String(user.id) === String(postOwnerId)) {
        return true;
      }
      return hasPermission(PERMISSIONS.MODERATE_POST);
    },
    [user, hasPermission],
  );

  const canEditComment = useCallback(
    (comment: Comment) => {
      if (
        user &&
        comment.owner &&
        String(user.id) === String(comment.owner.id)
      ) {
        return (
          new Date(comment.createdAt).getTime() <
          new Date().getTime() - 30 * 60 * 1000
        ); // Allow editing within 30 minutes of creation
      }
      return false;
    },
    [user],
  );

  const canDeleteComment = useCallback(
    (commentOwnerId?: string | null) => {
      if (
        user &&
        commentOwnerId &&
        String(user.id) === String(commentOwnerId)
      ) {
        return true;
      }
      return hasPermission(PERMISSIONS.MODERATE_COMMENT);
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
      if (
        user &&
        materialOwnerId &&
        String(user.id) === String(materialOwnerId)
      ) {
        return true;
      }
      return false;
    },
    [user],
  );

  const canDeleteMaterial = useCallback(
    (materialOwnerId?: string | number | null) => {
      if (
        user &&
        materialOwnerId &&
        String(user.id) === String(materialOwnerId)
      ) {
        return true;
      }
      return hasPermission(PERMISSIONS.MODERATE_MATERIAL);
    },
    [user, hasPermission],
  );

  const canCreateEvent = hasPermission(PERMISSIONS.CREATE_EVENT);

  const canEditEvent = useCallback(
    (eventOwnerId?: string | number | null) => {
      if (user && eventOwnerId && String(user.id) === String(eventOwnerId)) {
        return hasPermission(PERMISSIONS.UPDATE_EVENT);
      }
      return hasPermission(PERMISSIONS.MODERATE_EVENT);
    },
    [user, hasPermission],
  );

  const canDeleteEvent = useCallback(
    (eventOwnerId?: string | number | null) => {
      if (user && eventOwnerId && String(user.id) === String(eventOwnerId)) {
        return hasPermission(PERMISSIONS.DELETE_EVENT);
      }
      return hasPermission(PERMISSIONS.MODERATE_EVENT);
    },
    [user, hasPermission],
  );

  return {
    user,
    isAuthenticated: Boolean(user),
    isMember,
    isPlatformAdmin,
    isOwner,
    communityRole,
    globalPermissions,
    hasPermission,
    // Community Permissions
    canCreateCommunity,
    canLeaveCommunity: isMember && !isOwner,
    canEditCommunity,
    canDeleteCommunity,
    canVerifyCommunity,
    // Teacher Permissions
    canCreateTeacher,
    canUpdateTeacher,
    canDeleteTeacher,
    // Teacher Rating Permissions
    canCreateTeacherRating,
    canUpdateTeacherRating,
    canDeleteTeacherRating,
    // Community Member Permissions
    canManageJoinCodes,
    canAddMember,
    canRemoveMember,
    canUpdateMemberRole,
    // Study Year Permissions
    canCreateStudyYear,
    canDeleteStudyYear,
    // Course Permissions
    canCreateCourse,
    canEditCourse,
    canDeleteCourse,
    canArchiveCourse,
    // Discussion Permissions
    canCreatePost,
    canPinPost,
    canCreateComment,
    canEditPost,
    canDeletePost,
    canEditComment,
    canDeleteComment,
    // Course Folder & Material Permissions
    canCreateFolder,
    canCreateMaterial,
    canEditFolder,
    canDeleteFolder,
    canEditMaterial,
    canDeleteMaterial,
    // Calendar & Reminder Permissions
    canCreateEvent,
    canEditEvent,
    canDeleteEvent,
  };
}
