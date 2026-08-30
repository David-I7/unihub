import { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Plus,
  Copy,
  Check,
  Trash2,
  Edit2,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getErrorMessage } from "@/api/types";
import { useJoinCodes, useDeleteJoinCode } from "../../api/joinCodes";
import type { CommunityJoinCode } from "../../api/types";
import { CreateJoinCodeModal } from "./CreateJoinCodeModal";
import { EditJoinCodeModal } from "./EditJoinCodeModal";

interface JoinCodesTabProps {
  communitySlug: string;
}

export function JoinCodesTab({ communitySlug }: JoinCodesTabProps) {
  const {
    data: joinCodes = [],
    isLoading,
    isError,
    refetch,
  } = useJoinCodes(communitySlug);
  const deleteMutation = useDeleteJoinCode();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<CommunityJoinCode | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [currentTime] = useState(() => Date.now());

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Copied code "${code}" to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleCopyLink = async (code: string) => {
    try {
      const origin = window.location.origin;
      const inviteUrl = `${origin}/communities/${communitySlug}/join?code=${code}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Copied community invite link to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDelete = async (code: CommunityJoinCode) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke and delete join code ${code.code}? Anyone with this code will no longer be able to use it.`,
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({
        communitySlug,
        codeId: code.id,
      });
      toast.success(`Join code ${code.code} revoked.`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to revoke join code."));
    }
  };

  return (
    <div className="space-y-4 py-1">
      {/* Header with quick summary & Create button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/60">
        <div>
          <h3 className="font-heading text-sm font-bold text-foreground">
            Active Invitation Codes
          </h3>
          <p className="text-xs text-muted-foreground">
            Generate and manage access codes for joining this community.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="gap-1.5 font-bold cursor-pointer"
        >
          <Plus className="size-4" />
          Generate New Code
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Spinner className="size-6 text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center space-y-2">
          <p className="text-xs font-semibold text-destructive">
            Failed to load invitation codes.
          </p>
          <Button variant="outline" size="xs" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : joinCodes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-3">
          <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <KeyRound className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading text-xs font-bold text-foreground">
              No Active Invitation Codes
            </h4>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Generate a code to invite students, professors, or administrators
              to this community.
            </p>
          </div>
          <Button
            size="xs"
            variant="outline"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 font-semibold"
          >
            <Plus className="size-3.5" />
            Create First Code
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {joinCodes.map((code) => {
            const isExpired =
              code.expiresAt &&
              new Date(code.expiresAt).getTime() < currentTime;
            const isMaxedOut =
              code.maxUses !== null && code.usesCount >= code.maxUses;
            const isInactive = isExpired || isMaxedOut;

            return (
              <div
                key={code.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors"
              >
                {/* Code & Badges */}
                <div className="space-y-1.5 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                      {code.code}
                    </span>

                    {isInactive ? (
                      <Badge
                        variant="secondary"
                        className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] py-0 px-1.5"
                      >
                        {isExpired ? "Expired" : "Maxed Out"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-1.5"
                      >
                        Active
                      </Badge>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-muted-foreground/80" />
                      {code.usesCount} / {code.maxUses ?? "∞"} uses
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-muted-foreground/80" />
                      {code.expiresAt
                        ? `Expires ${new Date(code.expiresAt).toLocaleDateString()}`
                        : "Never expires"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopyCode(code.code)}
                    title="Copy code"
                    className="h-8 px-2 text-xs font-semibold gap-1"
                  >
                    {copiedCode === code.code ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                    <span>Copy</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleCopyLink(code.code)}
                    title="Copy invite link"
                    className="h-8 px-2 text-xs font-semibold gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Link</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEditingCode(code)}
                    title="Edit join code limits"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="size-3.5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDelete(code)}
                    title="Revoke and delete code"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateJoinCodeModal
        communitySlug={communitySlug}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <EditJoinCodeModal
        communitySlug={communitySlug}
        joinCode={editingCode}
        open={Boolean(editingCode)}
        onOpenChange={(open) => !open && setEditingCode(null)}
      />
    </div>
  );
}
