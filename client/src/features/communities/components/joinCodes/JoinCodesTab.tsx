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
  MoreVertical,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/api/types";
import { useJoinCodes, useDeleteJoinCode } from "../../api/joinCodes";
import type { CommunityJoinCode } from "../../api/types";
import { formatDateTime24h } from "@/lib/dateUtils";
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
      const url = `${window.location.origin}/communities/${communitySlug}/join?code=${code}`;
      await navigator.clipboard.writeText(url);
      toast.success("Copied invite link to clipboard!");
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleDelete = (code: CommunityJoinCode) => {
    deleteMutation.mutate(
      { communitySlug, codeId: code.id },
      {
        onSuccess: () => {
          toast.success(`Revoked join code "${code.code}".`);
        },
        onError: (err) => {
          toast.error(
            getErrorMessage(err, "Failed to revoke community join code."),
          );
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with New Code Action */}
      <div className="flex items-center justify-end gap-4">
        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="gap-1.5 font-bold cursor-pointer shrink-0"
        >
          <Plus className="size-4" />
          <span>New Join Code</span>
        </Button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8 gap-2">
          <Spinner className="size-6" />
          <span className="text-xs text-muted-foreground">
            Loading invitation codes...
          </span>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-destructive">
            Failed to load invitation codes.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : joinCodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <KeyRound className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-heading text-sm font-semibold text-foreground">
              No Active Join Codes
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Generate a join code so students and peers can enter this
              community.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/60 rounded-2xl border bg-card overflow-hidden">
          {joinCodes.map((code) => {
            const isExpired =
              code.expiresAt &&
              new Date(code.expiresAt).getTime() < currentTime;
            const isMaxedOut =
              code.maxUses !== null &&
              code.maxUses !== undefined &&
              code.usesCount >= code.maxUses;
            const isInactive = isExpired || isMaxedOut;

            return (
              <div
                key={code.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/10 transition-colors"
              >
                {/* Code & Badges */}
                <div className="space-y-1.5 min-w-[180px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-widest text-secondary-foreground bg-secondary border border-border/60 px-2 py-0.5 rounded-md">
                      {code.code}
                    </span>

                    {isInactive ? (
                      <Badge
                        variant="destructive"
                        size="xs"
                        className="font-medium"
                      >
                        {isExpired ? "Expired" : "Maxed Out"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="success"
                        size="xs"
                        className="font-medium"
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
                        ? `Expires ${formatDateTime24h(code.expiresAt)}`
                        : "Never expires"}
                    </span>
                  </div>
                </div>

                {/* Actions: Copy Quick Button + 3-dots Dropdown Menu */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
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
                    <span>Copy Code</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                          aria-label="More actions"
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => handleCopyLink(code.code)}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingCode(code)}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Edit2 className="size-3.5" />
                        <span>Edit Limits</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => handleDelete(code)}
                        className="gap-2 cursor-pointer text-xs"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      {editingCode && (
        <EditJoinCodeModal
          communitySlug={communitySlug}
          joinCode={editingCode}
          open={Boolean(editingCode)}
          onOpenChange={(open) => {
            if (!open) setEditingCode(null);
          }}
        />
      )}
    </div>
  );
}
