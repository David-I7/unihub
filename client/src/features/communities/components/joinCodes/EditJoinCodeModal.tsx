import { useState } from "react";
import { toast } from "sonner";
import { Settings2 } from "lucide-react";
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
import { getErrorMessage } from "@/api/types";
import { useUpdateJoinCode } from "../../api/joinCodes";
import type { CommunityJoinCode } from "../../api/types";

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

  if (!joinCode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const maxUsesPayload = isUnlimitedUses
      ? -1
      : maxUses
        ? parseInt(maxUses, 10)
        : undefined;

    const validForHoursPayload = isUnlimitedDuration
      ? -1
      : validForHours
        ? parseInt(validForHours, 10)
        : undefined;

    if (maxUsesPayload === undefined && validForHoursPayload === undefined) {
      toast.info("No modifications made.");
      onOpenChange(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        communitySlug,
        codeId: joinCode.id,
        payload: {
          maxUses: maxUsesPayload,
          validForHours: validForHoursPayload,
        },
      });

      toast.success(`Join code ${joinCode.code} updated successfully!`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update join code."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
            <Settings2 className="size-5" />
          </div>
          <DialogTitle>Edit Join Code ({joinCode.code})</DialogTitle>
          <DialogDescription>
            Adjust the usage limit or extend the expiration date for this code.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
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
                variant={isUnlimitedUses ? "default" : "outline"}
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
              Currently used: {joinCode.usesCount} times.
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
                variant={isUnlimitedDuration ? "default" : "outline"}
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
              disabled={updateMutation.isPending}
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
