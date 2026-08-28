import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { AUTH_CHANNEL_NAME } from "@/hooks/usePopup";
import type { AuthProvider } from "@/types/domain";

const VALID_PROVIDERS: AuthProvider[] = ["GOOGLE", "GITHUB"];

export default function OAuth2CallbackPage() {
  const sent = useRef(false);
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const statusParam = searchParams.get("status")?.toLowerCase();
  const providerParam = searchParams.get("provider")?.toUpperCase() as
    | AuthProvider
    | undefined;

  useEffect(() => {
    if (sent.current || !providerParam || !VALID_PROVIDERS.includes(providerParam)) {
      return;
    }

    if (statusParam !== "success" && statusParam !== "failure") {
      return;
    }

    const channelName =
      providerParam === "GOOGLE"
        ? AUTH_CHANNEL_NAME.GOOGLE_OAUTH2
        : AUTH_CHANNEL_NAME.GITHUB_OAUTH2;

    const channel = new BroadcastChannel(channelName);
    channel.postMessage({
      type: statusParam === "success" ? "OAUTH_SUCCESS" : "OAUTH_FAILURE",
      provider: providerParam,
    });

    sent.current = true;
    channel.close();
  }, [providerParam, statusParam]);

  return null;
}
