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
      const { communitySlug, studyYear, courseSlug, postId } = notification;

      if (courseSlug && studyYear && communitySlug) {
        const postParam = postId ? `&postId=${postId}` : "";
        navigate(
          `/communities/${communitySlug}/study-years/${studyYear.toLowerCase()}/courses/${courseSlug}?tab=posts${postParam}`,
        );
        return;
      }

      if (communitySlug) {
        const postParam = postId ? `&postId=${postId}` : "";
        navigate(`/communities/${communitySlug}?tab=posts${postParam}`);
        return;
      }
    }
  };

  return { handleNotificationClick };
}
