import { toast } from "sonner";
import { ShieldCheck, ShieldAlert } from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/api/types";
import { useUpdateCommunity } from "../../api/updateCommunity";
import type { Community } from "../../api/types";

interface VerifyCommunityModalProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VerifyCommunityModal({
  community,
  open,
  onOpenChange,
}: VerifyCommunityModalProps) {
  const updateMutation = useUpdateCommunity();
  const isCurrentlyVerified = Boolean(community.verified);

  const handleToggleVerification = async () => {
    const nextVerifiedState = !isCurrentlyVerified;

    try {
      await updateMutation.mutateAsync({
        communitySlug: community.slug,
        payload: {
          verified: nextVerifiedState,
        },
      });

      toast.success(
        nextVerifiedState
          ? `Community "${community.name}" is now verified!`
          : `Verification removed from "${community.name}".`,
      );
      onOpenChange(false);
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Failed to update verification status.",
      );
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold font-heading">
            {isCurrentlyVerified
              ? "Revoke Community Verification"
              : "Verify Community"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isCurrentlyVerified
              ? `Remove the official verified status from ${community.name}.`
              : `Grant an official verified badge to ${community.name}.`}
          </DialogDescription>
        </DialogHeader>

        {/* Action Overview Callout */}
        <div
          className={`rounded-xl border p-3.5 space-y-2 text-xs leading-relaxed ${
            isCurrentlyVerified
              ? "border-amber-500/30 bg-amber-500/5 text-muted-foreground"
              : "border-emerald-500/30 bg-emerald-500/5 text-muted-foreground"
          }`}
        >
          <div
            className={`flex items-center gap-1.5 font-semibold text-xs ${
              isCurrentlyVerified
                ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isCurrentlyVerified ? (
              <ShieldAlert className="size-4 shrink-0" />
            ) : (
              <ShieldCheck className="size-4 shrink-0" />
            )}
            <span>
              {isCurrentlyVerified
                ? "Verification Status Removal"
                : "What does verification do?"}
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            {isCurrentlyVerified ? (
              <>
                <li>
                  The verified badge will be removed from the community banner
                  and listings.
                </li>
                <li>
                  The community will appear as a standard student-led group.
                </li>
                <li>
                  You can re-grant verification status at any time as an
                  administrator.
                </li>
              </>
            ) : (
              <>
                <li>
                  Displays an official verified checkmark on the community
                  banner and cards.
                </li>
                <li>
                  Increases trust and recognition among students and university
                  faculty.
                </li>
                <li>
                  Helps learners easily distinguish authentic faculty
                  communities.
                </li>
              </>
            )}
          </ul>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto text-xs h-9 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isCurrentlyVerified ? "destructive" : "default"}
            disabled={updateMutation.isPending}
            onClick={handleToggleVerification}
            className="w-full sm:w-auto text-xs h-9 cursor-pointer font-semibold gap-1.5"
          >
            <span>
              {updateMutation.isPending
                ? "Updating..."
                : isCurrentlyVerified
                  ? "Revoke Verification"
                  : "Confirm Verification"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
