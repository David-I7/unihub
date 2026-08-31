import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  LogIn,
  ArrowRight,
} from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/features/auth";
import { useJoinCodePreview } from "@/features/communities/api/joinCodes";
import { useJoinCommunity } from "@/features/communities/api/joinCommunity";
import { computeGradient } from "@/lib/gradientUtils";
import { getErrorMessage } from "@/api/types";

export default function CommunityJoinPage() {
  const { communitySlug = "" } = useParams<{ communitySlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const storageKey = `join_code_${communitySlug.toLowerCase()}`;
  const [code, setCode] = useState<string>(() => {
    const urlCode = searchParams.get("code");
    if (urlCode) {
      sessionStorage.setItem(storageKey, urlCode.toUpperCase().trim());
      return urlCode.toUpperCase().trim();
    }
    return sessionStorage.getItem(storageKey) || "";
  });

  const [manualCodeInput, setManualCodeInput] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Immediately obfuscate / strip ?code=... from the URL bar on load
  useEffect(() => {
    if (searchParams.has("code")) {
      navigate(`/communities/${communitySlug}/join`, { replace: true });
    }
  }, [searchParams, communitySlug, navigate]);

  const {
    data: preview,
    isLoading: isPreviewLoading,
    isError: isPreviewError,
    error: previewError,
  } = useJoinCodePreview(communitySlug, code, Boolean(code));

  const joinMutation = useJoinCommunity();

  const handleJoin = async () => {
    if (!code) return;
    setActionError(null);

    try {
      const enrolled = await joinMutation.mutateAsync({ joinCode: code });
      sessionStorage.removeItem(storageKey);
      toast.success(`Successfully joined "${enrolled.name}"!`);
      navigate(`/communities/${enrolled.slug}`);
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Failed to join community. The code may be invalid, exhausted, or expired.",
      );
      setActionError(message);
      toast.error(message);
    }
  };

  const handleManualCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualCodeInput.trim().toUpperCase();
    if (clean.length !== 8) {
      setActionError("Join code must be exactly 8 characters.");
      return;
    }
    sessionStorage.setItem(storageKey, clean);
    setCode(clean);
    setActionError(null);
  };

  const handleClearCode = () => {
    sessionStorage.removeItem(storageKey);
    setCode("");
    setActionError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* No Code State -> Manual Input Form */}
        {!code && (
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2">
                <KeyRound className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold">Join Community</CardTitle>
              <CardDescription>
                Enter an invitation code to join{" "}
                <span className="font-semibold text-foreground">
                  {communitySlug}
                </span>
                .
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualCodeSubmit} className="space-y-4">
                {actionError && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                    {actionError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Input
                    placeholder="e.g. 9ABCDEF4"
                    value={manualCodeInput}
                    onChange={(e) => {
                      setActionError(null);
                      setManualCodeInput(e.target.value.toUpperCase());
                    }}
                    maxLength={8}
                    className="text-center font-mono text-xl tracking-widest uppercase font-bold h-12 rounded-xl"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-foreground text-center">
                    Enter the 8-character invitation code provided by an administrator.
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={manualCodeInput.trim().length !== 8}
                  className="w-full h-10 font-bold rounded-xl cursor-pointer"
                >
                  Verify Code
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Code is provided -> Loading Preview */}
        {code && isPreviewLoading && (
          <Card className="rounded-2xl border p-8 text-center space-y-4 shadow-sm">
            <Spinner className="size-8 mx-auto text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              Verifying community invitation code...
            </p>
          </Card>
        )}

        {/* Code is provided -> Error / Invalid Preview */}
        {code && !isPreviewLoading && isPreviewError && (
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-2">
                <ShieldAlert className="size-6" />
              </div>
              <CardTitle className="text-xl font-bold">Invalid Invitation</CardTitle>
              <CardDescription>
                {getErrorMessage(
                  previewError,
                  "This invite code is invalid, expired, or has reached its maximum usage limit.",
                )}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClearCode}
                className="w-full h-10 font-semibold rounded-xl"
              >
                Try Another Code
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/communities")}
                className="w-full text-xs text-muted-foreground"
              >
                Browse All Communities
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Code is provided -> Valid Preview */}
        {code && !isPreviewLoading && preview && (
          <Card className="rounded-2xl border overflow-hidden shadow-md">
            {/* Header Banner with Community Gradient */}
            <div
              className="h-28 w-full p-4 flex items-end justify-between text-white"
              style={{ background: computeGradient(preview.backgroundColor) }}
            >
              {preview.verified ? (
                <Badge
                  variant="secondary"
                  className="bg-black/40 text-white border-0 backdrop-blur-xs font-semibold gap-1 text-[11px]"
                >
                  <ShieldCheck className="size-3 text-emerald-400" />
                  Verified Community
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-black/40 text-white border-0 backdrop-blur-xs font-semibold gap-1 text-[11px]"
                >
                  <ShieldAlert className="size-3 text-red-400" />
                  Unverified Community
                </Badge>
              )}

              <span className="text-xs font-semibold bg-black/40 px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                <Users className="size-3" />
                {preview.memberCount} members
              </span>
            </div>

            <CardHeader className="pt-6">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {preview.name}
                </CardTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  /communities/{preview.slug}
                </p>
              </div>
              <CardDescription className="pt-2 text-sm leading-relaxed">
                {preview.description || "No description provided."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {actionError && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
                  {actionError}
                </div>
              )}

              {/* Already a member */}
              {preview.isMember && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      You are already a member!
                    </p>
                    <p className="text-muted-foreground">
                      You have full access to this community's content and materials.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2.5 pb-6">
              {!user ? (
                <Button
                  onClick={() => navigate(`/login?redirect=/communities/${preview.slug}/join`)}
                  className="w-full h-11 font-bold rounded-xl gap-2 cursor-pointer"
                >
                  <LogIn className="size-4" />
                  Log in to Join Community
                </Button>
              ) : preview.isMember ? (
                <Button
                  onClick={() => navigate(`/communities/${preview.slug}`)}
                  className="w-full h-11 font-bold rounded-xl gap-2 cursor-pointer"
                >
                  Go to Community
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                  className="w-full h-11 font-bold rounded-xl gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {joinMutation.isPending ? (
                    <>
                      <Spinner className="size-4" /> Joining...
                    </>
                  ) : (
                    "Join Community"
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCode}
                className="text-xs text-muted-foreground"
              >
                Use a different code
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
