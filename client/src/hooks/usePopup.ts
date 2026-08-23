import { useEffect, useRef, useState } from "react";

type usePopupProps = {
  url?: string | URL;
  target?: string;
  features?: string;
  channelName: (typeof AUTH_CHANNEL_NAME)[keyof typeof AUTH_CHANNEL_NAME];
  onMessageReceived: (message: any) => void;
  onPopupClose?: () => void;
};

export const AUTH_CHANNEL_NAME = {
  GOOGLE_OAUTH2: "unihub-google-oauth" as const,
  GITHUB_OAUTH2: "unihub-github-oauth" as const,
};

export const usePopup = ({
  url,
  target,
  features,
  channelName,
  onMessageReceived,
  onPopupClose,
}: usePopupProps) => {
  const popup = useRef<WindowProxy | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openPopup = () => {
    popup.current = window.open(url, target, features);
    setIsOpen(Boolean(popup.current));
  };

  const closePopup = () => {
    if (!isOpen || !popup.current) return;
    setIsOpen(false);
    onPopupClose?.();
    popup.current.close();
    popup.current = null;
  };

  useEffect(() => {
    if (!isOpen || !popup.current) return;

    const pollPopupClose = (popup: WindowProxy) => {
      const intervalId = setInterval(() => {
        if (popup.closed) {
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
  }, [isOpen, onMessageReceived, channelName]);

  return { closePopup, openPopup, isOpen };
};
