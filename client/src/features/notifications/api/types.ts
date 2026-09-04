import type { ResourceOwner } from "@/types/domain";
import type { PaginatedRequest } from "@/api/types";

export type NotificationCategory = "EVENT" | "POST" | "SYSTEM";

export type EventNotificationType =
  | "EVENT_REMINDER"
  | "EVENT_UPDATED"
  | "EVENT_CANCELLED";

export type PostNotificationType =
  | "COMMUNITY_POST"
  | "COURSE_POST"
  | "POST_COMMENT"
  | "POST_LIKE";

export type SystemNotificationType =
  | "SYSTEM_ANNOUNCEMENT"
  | "SYSTEM_MAINTENANCE"
  | "SYSTEM_GENERAL";

export type NotificationType =
  | EventNotificationType
  | PostNotificationType
  | SystemNotificationType;

export interface BaseNotification {
  id: string;
  message: string;
  category: NotificationCategory;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  eventId?: string | null;
  postId?: string | null;
  commentId?: string | null;
  actor?: ResourceOwner | null;
}

export interface EventNotification extends BaseNotification {
  category: "EVENT";
  type: EventNotificationType;
  eventId: string | null;
  actor: ResourceOwner | null;
}

export interface PostNotification extends BaseNotification {
  category: "POST";
  type: PostNotificationType;
  eventId?: null;
  postId: string;
  commentId?: string | null;
  actor: ResourceOwner | null;
}

export interface SystemNotification extends BaseNotification {
  category: "SYSTEM";
  type: SystemNotificationType;
  eventId?: null;
  postId?: null;
  commentId?: null;
  actor: null;
}

export type NotificationResponse =
  | EventNotification
  | PostNotification
  | SystemNotification;

export type AppNotification = NotificationResponse;

export interface NotificationQueryParams extends Partial<PaginatedRequest> {
  category?: NotificationCategory;
  type?: NotificationType;
  isRead?: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
