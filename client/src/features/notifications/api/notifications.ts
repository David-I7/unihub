import client from "@/api/client";
import { useAuthStore } from "@/features/auth";
import {
  getPaginatedNextPageParam,
  getPaginatedPrevPageParam,
  type PaginatedResponse,
} from "@/api/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import type {
  AppNotification,
  NotificationCategory,
  NotificationQueryParams,
  UnreadCountResponse,
} from "./types";
import {
  rollbackOptimisticContext,
  updateInfiniteQueryItem,
  patchDetailQuery,
} from "@/lib/queryCacheUtils";

export const notificationKeys = {
  all: ["notifications"] as const,
  infinites: () => [...notificationKeys.all, "infinite"] as const,
  infinite: (params: Omit<NotificationQueryParams, "page"> = {}) =>
    [...notificationKeys.infinites(), params] as const,
  unreadCounts: () => [...notificationKeys.all, "unread-count"] as const,
  unreadCount: () => [...notificationKeys.unreadCounts(), "ALL"] as const,
};

export async function getNotifications(
  params: NotificationQueryParams = {},
): Promise<PaginatedResponse<AppNotification>> {
  const response = await client.get<PaginatedResponse<AppNotification>>(
    "/notifications",
    { params },
  );
  return response.data;
}

export async function getUnreadCount(
  category?: NotificationCategory,
): Promise<number> {
  const response = await client.get<UnreadCountResponse>(
    "/notifications/unread-count",
    { params: category ? { category } : undefined },
  );
  return response.data.unreadCount;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await client.patch(`/notifications/${notificationId}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await client.patch("/notifications/read-all");
}

export function useInfiniteNotifications(
  params: Omit<NotificationQueryParams, "page"> = {},
  options: { enabled?: boolean } = {},
) {
  const user = useAuthStore((state) => state.user);
  const { enabled = Boolean(user) } = options;

  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(params),
    queryFn: ({ pageParam = 0 }) =>
      getNotifications({ ...params, page: pageParam, size: 20 }),
    initialPageParam: 0,
    getNextPageParam: getPaginatedNextPageParam,
    getPreviousPageParam: getPaginatedPrevPageParam,
    enabled: enabled && Boolean(user),
  });
}

export function useUnreadNotificationCount() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadCount(),
    enabled: Boolean(user),
    refetchInterval: 60000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousData = queryClient.getQueriesData<
        InfiniteData<PaginatedResponse<AppNotification>>
      >({
        queryKey: notificationKeys.infinites(),
      });

      const previousCount = queryClient.getQueriesData<number>({
        queryKey: notificationKeys.unreadCount(),
      })?.[0];

      // Optimistically update infinite queries
      updateInfiniteQueryItem<AppNotification>(
        queryClient,
        notificationKeys.infinites(),
        notificationId,
        (item) => ({ ...item, isRead: true }),
      );

      // Optimistically decrement unread count
      patchDetailQuery<number>(
        queryClient,
        notificationKeys.unreadCount(),
        (item) => Math.max(0, item - 1),
      );

      return { previousData, previousCount };
    },
    onError: (_err, _variables, context) => {
      if (context) {
        rollbackOptimisticContext(queryClient, {
          previousDetail: context.previousCount,
          previousQueries: context.previousData,
        });
      }
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previousData = queryClient.getQueriesData<
        InfiniteData<PaginatedResponse<AppNotification>>
      >({
        queryKey: notificationKeys.infinites(),
      });

      const previousCount = queryClient.getQueriesData<number>({
        queryKey: notificationKeys.unreadCount(),
      })?.[0];

      // Optimistically update infinite queries
      updateInfiniteQueryItem<AppNotification>(
        queryClient,
        notificationKeys.infinites(),
        () => true,
        (item) => ({ ...item, isRead: true }),
      );

      // Optimistically decrement unread count
      patchDetailQuery<number>(
        queryClient,
        notificationKeys.unreadCount(),
        () => 0,
      );

      return { previousData, previousCount };
    },
    onError: (_err, _variables, context) => {
      if (context) {
        rollbackOptimisticContext(queryClient, {
          previousDetail: context.previousCount,
          previousQueries: context.previousData,
        });
      }
    },
  });
}
