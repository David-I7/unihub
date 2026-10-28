import type { AuthProvider } from "@/types/domain";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { OAuth2Response } from "../api/types";
import { useRefresh } from "../api/refresh";
import { relativeUrlSchema } from "../schemas/authSchemas";

type ProviderError = {
  provider: AuthProvider;
  message: string;
};

export default function useProviderForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldRedirect = relativeUrlSchema.safeParse(
    searchParams.get("redirect"),
  ).success;
  const refreshMutation = useRefresh();
  const [error, setError] = useState<ProviderError | null>(null);
  const [activeProvider, setActiveProvider] = useState<AuthProvider | null>(
    null,
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

  const handleSuccess = useCallback(
    async (message: OAuth2Response) => {
      try {
        await refreshMutation.mutateAsync();
        const redirectTarget = shouldRedirect
          ? searchParams.get("redirect")!
          : "/";
        navigate(redirectTarget);
      } catch {
        handleFailure({
          provider: message.provider,
          type: "OAUTH_FAILURE",
        });
      }
    },
    [navigate, refreshMutation, handleFailure, searchParams],
  );

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
