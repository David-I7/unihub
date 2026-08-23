import { useEffect, useRef } from "react";

import { AUTH_CHANNEL_NAME } from "../hooks/usePopup";
import { useLocation } from "react-router";

const PROVIDERS = ["GOOGLE", "GITHUB"] as const;
export default function HandleOAuthFailurePage() {
  const { search } = useLocation();
  const provider = new URLSearchParams(search).get("provider");

  if (provider === null || !PROVIDERS.includes(provider as any)) return null;

  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;

    let channel: BroadcastChannel;

    if (provider === "GOOGLE") {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME.GOOGLE_OAUTH2);
    } else {
      channel = new BroadcastChannel(AUTH_CHANNEL_NAME.GITHUB_OAUTH2);
    }

    channel.postMessage({
      type: "OAUTH_FAILURE",
      provider,
    });

    channel.close();
  }, []);

  return null;
}
