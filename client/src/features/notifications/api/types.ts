import type { ResourceOwner } from "@/types/domain";
import type { PaginatedRequest } from "@/api/types";

export type NotificationCategory = "EVENT" | "POST" | "SYSTEM";

export type EventNotificationType = "REMINDER" | "UPDATED" | "CANCELLED";

export type PostNotificationType =
  | "COMMUNITY_POST"
  | "COURSE_POST"
  | "COMMENT"
  | "LIKE";

export type SystemNotificationType = "ANNOUNCEMENT" | "MAINTENANCE" | "GENERAL";

export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  createdAt: string;
}

export interface EventNotification extends BaseNotification {
  category: "EVENT";
  type: EventNotificationType;
  eventId?: string | null;
  actor?: ResourceOwner | null;
  communitySlug?: string | null;
}

export interface PostNotification extends BaseNotification {
  category: "POST";
  type: PostNotificationType;
  postId?: string | null;
  actor?: ResourceOwner | null;
  communitySlug?: string | null;
  studyYear?: string | null;
  courseSlug?: string | null;
}

export interface SystemNotification extends BaseNotification {
  category: "SYSTEM";
  type: SystemNotificationType;
}

export type AppNotification =
  | EventNotification
  | PostNotification
  | SystemNotification;

export interface NotificationQueryParams extends Partial<PaginatedRequest> {
  category?: NotificationCategory;
  type?: string;
  isRead?: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
