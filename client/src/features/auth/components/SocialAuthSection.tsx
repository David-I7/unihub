import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { OAuthButton } from "./OAuthButton";
import { useNavigate } from "react-router";
import type { OAuth2Response } from "../api/types";
import type { AuthProvider } from "@/types/domain";

export interface SocialAuthSectionProps {
  onOpen: (provider: AuthProvider) => void;
  onSuccess: (message: OAuth2Response) => void;
  onFailure: (message: OAuth2Response) => void;
  onClose: () => void;
  activeProvider: AuthProvider | null;
  providerError: { provider: AuthProvider; message: string } | null;
  footerText: string;
  footerActionText: string;
  footerActionTo: string;
}

export function SocialAuthSection({
  onOpen,
  onSuccess,
  onFailure,
  onClose,
  activeProvider,
  providerError,
  footerText,
  footerActionText,
  footerActionTo,
}: SocialAuthSectionProps) {
  const navigate = useNavigate();

  return (
    <>
      <FieldSeparator className="text-xs text-muted-foreground">
        Or
      </FieldSeparator>

      <FieldGroup>
        <Field>
          <OAuthButton
            provider="GOOGLE"
            onOpen={() => onOpen("GOOGLE")}
            onSuccess={onSuccess}
            onFailure={onFailure}
            onClose={onClose}
            disabled={activeProvider !== null}
          />
          {providerError && providerError.provider === "GOOGLE" && (
            <FieldError errors={[{ message: providerError.message }]} />
          )}
        </Field>

        <Field>
          <OAuthButton
            provider="GITHUB"
            onOpen={() => onOpen("GITHUB")}
            onSuccess={onSuccess}
            onFailure={onFailure}
            onClose={onClose}
            disabled={activeProvider !== null}
          />
          {providerError && providerError.provider === "GITHUB" && (
            <FieldError errors={[{ message: providerError.message }]} />
          )}
        </Field>

        <FieldDescription className="text-center text-xs">
          {footerText}{" "}
          <Button
            type="button"
            size="link"
            onClick={() => navigate(footerActionTo)}
            variant="link"
            className="text-xs font-semibold cursor-pointer"
          >
            {footerActionText}
          </Button>
        </FieldDescription>
      </FieldGroup>
    </>
  );
}

export default SocialAuthSection;
