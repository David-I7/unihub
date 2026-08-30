import { useCallback, useEffect, useRef, useState } from "react";

type usePopupProps<T = unknown> = {
  url?: string | URL;
  target?: string;
  features?: string;
  channelName: (typeof AUTH_CHANNEL_NAME)[keyof typeof AUTH_CHANNEL_NAME];
  onMessageReceived: (message: T) => void;
  onPopupClose?: () => void;
};

export const AUTH_CHANNEL_NAME = {
  GOOGLE_OAUTH2: "unihub-google-oauth" as const,
  GITHUB_OAUTH2: "unihub-github-oauth" as const,
};

export const usePopup = <T = unknown>({
  url,
  target,
  features,
  channelName,
  onMessageReceived,
  onPopupClose,
}: usePopupProps<T>) => {
  const popup = useRef<WindowProxy | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openPopup = useCallback(() => {
    popup.current = window.open(url, target, features);
    setIsOpen(Boolean(popup.current));
  }, [url, target, features]);

  const closePopup = useCallback(() => {
    if (!isOpen || !popup.current) return;
    setIsOpen(false);
    onPopupClose?.();
    popup.current.close();
    popup.current = null;
  }, [isOpen, onPopupClose]);

  useEffect(() => {
    if (!isOpen || !popup.current) return;

    const pollPopupClose = (win: WindowProxy) => {
      const intervalId = setInterval(() => {
        if (win.closed) {
          closePopup();
          clearInterval(intervalId);
        }
      }, 500);

      return () => clearInterval(intervalId);
    };

    const clearPopupPoll = pollPopupClose(popup.current);
    const authChannel = new BroadcastChannel(channelName);

    authChannel.addEventListener("message", (event) => {
      onMessageReceived(event.data);
    });

    return () => {
      authChannel.close();
      clearPopupPoll();
    };
  }, [isOpen, onMessageReceived, channelName, closePopup]);

  return { closePopup, openPopup, isOpen };
};
