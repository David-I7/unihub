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
import queryClient from "@/lib/queryClient";

export const notificationKeys = {
  all: ["notifications"] as const,
  infinites: () => [...notificationKeys.all, "infinite"] as const,
  infinite: (params: Omit<NotificationQueryParams, "page"> = {}) =>
    [...notificationKeys.infinites(), params] as const,
  unreadCounts: () => [...notificationKeys.all, "unread-count"] as const,
  unreadCount: (category?: NotificationCategory) =>
    [...notificationKeys.unreadCounts(), category ?? "ALL"] as const,
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

export function useUnreadNotificationCount(category?: NotificationCategory) {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: notificationKeys.unreadCount(category),
    queryFn: async () => {
      const prevCount = queryClient.getQueryData<number>(
        notificationKeys.unreadCount(category),
      );
      const newCount = await getUnreadCount(category);

      if (newCount !== prevCount) {
        queryClient.resetQueries({ queryKey: notificationKeys.infinites() });
      }
      return newCount;
    },
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

      const previousCount =
        queryClient.getQueryData<number>(notificationKeys.unreadCount()) ?? 0;

      // Optimistically update infinite queries
      queryClient.setQueriesData<
        InfiniteData<PaginatedResponse<AppNotification>>
      >({ queryKey: notificationKeys.infinites() }, (oldData) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            content: page.content.map((item) =>
              item.id === notificationId ? { ...item, isRead: true } : item,
            ),
          })),
        };
      });

      // Optimistically decrement unread count
      queryClient.setQueriesData<number>(
        { queryKey: notificationKeys.unreadCount() },
        (oldCount) => {
          if (typeof oldCount !== "number") return oldCount;
          return Math.max(0, oldCount - 1);
        },
      );

      return { previousData, previousCount };
    },
    onError: (_err, _variables, context) => {
      if (context) {
        const { previousData, previousCount } = context;

        for (const [queryKey, data] of previousData ?? []) {
          queryClient.setQueryData(queryKey, data);
        }
        queryClient.setQueriesData<number>(
          { queryKey: notificationKeys.unreadCount() },
          () => previousCount,
        );
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

      const previousCount =
        queryClient.getQueryData<number>(notificationKeys.unreadCount()) ?? 0;

      // Optimistically update infinite queries
      queryClient.setQueriesData<
        InfiniteData<PaginatedResponse<AppNotification>>
      >({ queryKey: notificationKeys.infinites() }, (oldData) => {
        if (!oldData?.pages) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            content: page.content.map((item) => ({ ...item, isRead: true })),
          })),
        };
      });

      // Optimistically decrement unread count
      queryClient.setQueriesData<number>(
        { queryKey: notificationKeys.unreadCount() },
        () => 0,
      );

      return { previousData, previousCount };
    },
    onError: (_err, _variables, context) => {
      if (context) {
        const { previousData, previousCount } = context;

        for (const [queryKey, data] of previousData) {
          queryClient.setQueryData(queryKey, data);
        }
        queryClient.setQueriesData<number>(
          { queryKey: notificationKeys.unreadCount() },
          () => previousCount,
        );
      }
    },
  });
}
