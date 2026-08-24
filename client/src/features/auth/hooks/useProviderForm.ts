import type { AuthProvider } from "@/types/domain";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import type { OAuth2Response } from "../types";
import { useRefresh } from "../api/refresh";

type ProviderError = {
  provider: AuthProvider;
  message: string;
};

export default function useProviderForm() {
  const navigate = useNavigate();
  const refreshMutation = useRefresh();
  const [error, setError] = useState<ProviderError | null>(null);
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(
    null,
  );

  const handleSuccess = useCallback(
    async (message: OAuth2Response) => {
      try {
        await refreshMutation.mutateAsync();
        navigate("/");
      } catch (error) {
        handleFailure({
          provider: message.provider,
          type: "OAUTH_FAILURE",
        });
      }
    },
    [navigate],
  );

  const handleFailure = useCallback((message: OAuth2Response) => {
    setError({
      provider: message.provider,
      message:
        "Failed to authenticate with " +
        message.provider +
        ". Please try again.",
    });
  }, []);

  const handleOpen = useCallback((provider: AuthProvider) => {
    setActiveProvider(provider);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    setActiveProvider(null);
  }, []);

  return {
    error,
    activeProvider,
    handleSuccess,
    handleFailure,
    handleOpen,
    handleClose,
  };
}
