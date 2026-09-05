import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { formatDateTime24h } from "@/lib/dateUtils";
import { getErrorMessage } from "@/api/types";
import { useUpdateJoinCode } from "../../api/joinCodes";
import type { CommunityJoinCode, UpdateJoinCodeDto } from "../../api/types";

interface EditJoinCodeModalProps {
  communitySlug: string;
  joinCode: CommunityJoinCode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditJoinCodeModal({
  communitySlug,
  joinCode,
  open,
  onOpenChange,
}: EditJoinCodeModalProps) {
  const [maxUses, setMaxUses] = useState<string>(
    joinCode?.maxUses !== null && joinCode?.maxUses !== undefined
      ? String(joinCode.maxUses)
      : "",
  );
  const [validForHours, setValidForHours] = useState<string>("");
  const [isUnlimitedUses, setIsUnlimitedUses] = useState(
    joinCode?.maxUses === null || joinCode?.maxUses === undefined,
  );
  const [isUnlimitedDuration, setIsUnlimitedDuration] = useState(
    joinCode?.expiresAt === null || joinCode?.expiresAt === undefined,
  );

  const updateMutation = useUpdateJoinCode();

  const [prevCodeId, setPrevCodeId] = useState(joinCode?.id);

  if (joinCode && joinCode.id !== prevCodeId) {
    setPrevCodeId(joinCode.id);
    setMaxUses(
      joinCode.maxUses !== null && joinCode.maxUses !== undefined
        ? String(joinCode.maxUses)
        : "",
    );
    setValidForHours("");
    setIsUnlimitedUses(
      joinCode.maxUses === null || joinCode.maxUses === undefined,
    );
    setIsUnlimitedDuration(
      joinCode.expiresAt === null || joinCode.expiresAt === undefined,
    );
  }

  if (!joinCode) return null;

  const initialIsUnlimitedUses =
    joinCode.maxUses === null || joinCode.maxUses === undefined;
  const initialNeverExpires =
    joinCode.expiresAt === null || joinCode.expiresAt === undefined;

  let maxUsesChanged = false;
  let maxUsesPayload: number | undefined;

  if (isUnlimitedUses) {
    if (!initialIsUnlimitedUses) {
      maxUsesChanged = true;
      maxUsesPayload = -1;
    }
  } else {
    const parsed = parseInt(maxUses, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      if (initialIsUnlimitedUses || parsed !== joinCode.maxUses) {
        maxUsesChanged = true;
        maxUsesPayload = parsed;
      }
    }
  }

  let validForHoursChanged = false;
  let validForHoursPayload: number | undefined;

  if (isUnlimitedDuration) {
    if (!initialNeverExpires) {
      validForHoursChanged = true;
      validForHoursPayload = -1;
    }
  } else {
    const parsed = parseInt(validForHours, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      validForHoursChanged = true;
      validForHoursPayload = parsed;
    }
  }

  const isDirty = maxUsesChanged || validForHoursChanged;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isDirty) {
      onOpenChange(false);
      return;
    }

    const payload: UpdateJoinCodeDto = {};
    if (maxUsesChanged && maxUsesPayload !== undefined) {
      payload.maxUses = maxUsesPayload;
    }
    if (validForHoursChanged && validForHoursPayload !== undefined) {
      payload.validForHours = validForHoursPayload;
    }

    try {
      await updateMutation.mutateAsync({
        communitySlug,
        codeId: joinCode.id,
        payload,
      });

      toast.success(`Join code ${joinCode.code} updated successfully!`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update join code."));
    }
  };

  const formattedCurrentExpiration = joinCode.expiresAt
    ? formatDateTime24h(joinCode.expiresAt)
    : "Never expires";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Join Code</DialogTitle>
          <DialogDescription>
            Adjust the usage limit or extend expiration for code{" "}
            <strong className="font-mono text-foreground font-bold">
              {joinCode.code}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Max Uses Config */}
          <Field>
            <FieldLabel htmlFor="editMaxUses">Max Uses</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="editMaxUses"
                type="number"
                min={1}
                disabled={isUnlimitedUses}
                placeholder="Unlimited uses"
                value={isUnlimitedUses ? "" : maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="text-xs"
              />
              <Button
                type="button"
                variant={isUnlimitedUses ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsUnlimitedUses(!isUnlimitedUses);
                  if (!isUnlimitedUses) setMaxUses("");
                }}
                className="shrink-0 text-xs"
              >
                {isUnlimitedUses ? "Unlimited ✓" : "Set Unlimited"}
              </Button>
            </div>
            <FieldDescription>
              Currently used:{" "}
              <strong className="text-foreground font-semibold">
                {joinCode.usesCount}
              </strong>{" "}
              times.
            </FieldDescription>
          </Field>

          {/* Extend validity */}
          <Field>
            <FieldLabel htmlFor="editValidityHours">
              Extend Validity (Hours)
            </FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="editValidityHours"
                type="number"
                min={1}
                disabled={isUnlimitedDuration}
                placeholder="Add validity (e.g. 48h)"
                value={isUnlimitedDuration ? "" : validForHours}
                onChange={(e) => setValidForHours(e.target.value)}
                className="text-xs"
              />
              <Button
                type="button"
                variant={isUnlimitedDuration ? "secondary" : "outline"}
                size="sm"
                onClick={() => {
                  setIsUnlimitedDuration(!isUnlimitedDuration);
                  if (!isUnlimitedDuration) setValidForHours("");
                }}
                className="shrink-0 text-xs"
              >
                {isUnlimitedDuration ? "Never Expires ✓" : "Never Expire"}
              </Button>
            </div>
            <FieldDescription>
              Current expiration:{" "}
              <strong className="text-foreground font-semibold">
                {formattedCurrentExpiration}
              </strong>
              .
            </FieldDescription>
          </Field>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="font-bold cursor-pointer"
            >
              {updateMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
