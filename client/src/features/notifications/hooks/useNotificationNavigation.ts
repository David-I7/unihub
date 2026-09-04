import { useNavigate } from "react-router";
import type { AppNotification } from "../api/types";
import { useMarkNotificationAsRead } from "../api/notifications";

export function useNotificationNavigation() {
  const navigate = useNavigate();
  const { mutate: markRead } = useMarkNotificationAsRead();

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }

    if (notification.category === "EVENT") {
      if (notification.eventId) {
        navigate(`/calendar?eventId=${notification.eventId}`);
      } else {
        navigate("/calendar");
      }
      return;
    }

    if (notification.category === "POST") {
      if (notification.postId) {
        const commentParam = notification.commentId
          ? `?commentId=${notification.commentId}`
          : "";
        navigate(`/posts/${notification.postId}${commentParam}`);
      }
      return;
    }
  };

  return { handleNotificationClick };
}
