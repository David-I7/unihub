import { usePopup } from "@/hooks/usePopup";
import { GOOGLE_LOGIN_URL } from "../api/auth";

import { AUTH_CHANNEL_NAME } from "@/hooks/usePopup";
import { useCallback, useEffect, useState } from "react";

export default function GoogleLogin() {
  const [status, setStatus] = useState<
    "idle" | "success" | "failure" | "veryfying"
  >("idle");
  const handleMessageReceived = useCallback(
    (message: { type: "OAUTH_SUCCESS" | "OAUTH_FAILURE" }) => {
      console.log("message received", message);
      if (message.type === "OAUTH_SUCCESS") {
        setStatus("success");
      } else if (message.type === "OAUTH_FAILURE") {
        setStatus("failure");
      }
    },
    [],
  );
  const handlePopupClose = useCallback(() => {
    console.log("popup closed");
  }, []);
  const { isOpen, openPopup, closePopup } = usePopup({
    url: GOOGLE_LOGIN_URL,
    channelName: AUTH_CHANNEL_NAME.OAUTH2,
    onMessageReceived: handleMessageReceived,
    onPopupClose: handlePopupClose,
  });

  useEffect(() => {
    if (!isOpen) return;
    setStatus("veryfying");
  }, [isOpen]);

  useEffect(() => {
    if (status === "success" || status === "failure") {
      closePopup();
      setStatus("idle");
    }
  }, [status]);

  return (
    <button
      style={{ cursor: "pointer", backgroundColor: "black", color: "white" }}
      disabled={isOpen}
      onClick={() => openPopup()}
    >
      Continue with Google
    </button>
  );
}
