import { useEffect, useRef } from "react";

import { AUTH_CHANNEL_NAME } from "../../../hooks/usePopup";

export default function HandleOAuthFailurePage() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME.OAUTH2);

    channel.postMessage({
      type: "OAUTH_FAILURE",
    });

    channel.close();
  }, []);

  return null;
}
