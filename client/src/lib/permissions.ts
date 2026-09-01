import type { CallerMembership } from "@/features/communities/api/types";

export const PERMISSIONS = {
  // Platform & Community
  CREATE_COMMUNITY: "create:community",
  UPDATE_COMMUNITY: "update:community",
  DELETE_COMMUNITY: "delete:community",
  VERIFY_COMMUNITY: "verify:community",
  UPDATE_USER_ROLE: "update:userRole",
  DELETE_USER: "delete:user",

  // Membership & Join Codes
  CREATE_JOIN_CODE: "create:joinCode",
  UPDATE_JOIN_CODE: "update:joinCode",
  DELETE_JOIN_CODE: "delete:joinCode",
  CREATE_MEMBER: "create:member",
  UPDATE_MEMBER_ROLE: "update:memberRole",
  DELETE_MEMBER: "delete:member",

  // Academic Structure
  CREATE_STUDY_YEAR: "create:studyYear",
  DELETE_STUDY_YEAR: "delete:studyYear",
  CREATE_COURSE: "create:course",
  UPDATE_COURSE: "update:course",
  DELETE_COURSE: "delete:course",
  ARCHIVE_COURSE: "archive:course",

  // Discussions (Posts & Comments)
  CREATE_POST: "create:post",
  UPDATE_POST: "update:post",
  DELETE_POST: "delete:post",
  LIKE_POST: "like:post",
  MODERATE_POST: "moderate:post",
  PIN_POST: "pin:post",
  CREATE_COMMENT: "create:comment",
  UPDATE_COMMENT: "update:comment",
  DELETE_COMMENT: "delete:comment",
  MODERATE_COMMENT: "moderate:comment",

  // Course Folders & Materials
  CREATE_FOLDER: "create:folder",
  UPDATE_FOLDER: "update:folder",
  DELETE_FOLDER: "delete:folder",
  MODERATE_FOLDER: "moderate:folder",
  CREATE_MATERIAL: "create:material",
  UPDATE_MATERIAL: "update:material",
  DELETE_MATERIAL: "delete:material",
  MODERATE_MATERIAL: "moderate:material",

  // Calendar & Reminders
  CREATE_EVENT: "create:event",
  UPDATE_EVENT: "update:event",
  DELETE_EVENT: "delete:event",
  MODERATE_EVENT: "moderate:event",
  CREATE_REMINDER: "create:reminder",
  DELETE_REMINDER: "delete:reminder",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];

export interface PermissionCheckContext {
  globalPermissions?: string[];
  callerMembership?: CallerMembership | null;
}

/**
 * Pure evaluation function checking permissions strictly in order:
 * 1. Check global role permissions from getProfile
 * 2. Check Community permission from callerMembership
 * With no hardcoded assumptions or overrides.
 */
export function checkPermission(
  permission: string,
  context: PermissionCheckContext,
): boolean {
  const { globalPermissions = [], callerMembership } = context;

  // 1. Check global role permissions from getProfile
  if (globalPermissions && globalPermissions.includes(permission)) {
    return true;
  }

  // 2. Check Community permission from callerMembership
  if (
    callerMembership &&
    callerMembership.permissions &&
    callerMembership.permissions.includes(permission)
  ) {
    return true;
  }

  return false;
}
