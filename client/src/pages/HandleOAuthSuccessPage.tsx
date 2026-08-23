import { useEffect, useRef } from "react";

import { AUTH_CHANNEL_NAME } from "../hooks/usePopup";
import { useLocation } from "react-router";

const PROVIDERS = ["GOOGLE", "GITHUB"] as const;
export default function HandleOAuthSuccessPage() {
  const sent = useRef(false);
  const { search } = useLocation();
  const provider = new URLSearchParams(search).get("provider");

  if (provider === null || !PROVIDERS.includes(provider as any)) return null;

  useEffect(() => {
    if (sent.current) return;

    let channel: BroadcastChannel;

    if (provider === "GOOGLE") {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME.GOOGLE_OAUTH2);
    } else {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME.GITHUB_OAUTH2);
    }

    channel.postMessage({
      type: "OAUTH_SUCCESS",
      provider,
    });

    sent.current = true;

    channel.close();
  }, []);

  return null;
}
