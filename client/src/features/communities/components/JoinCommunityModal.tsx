import { useState, useTransition } from "react";
import { useNavigate } from "react-router";
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
import { Field, FieldLabel } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useJoinCommunity } from "../api/joinCommunity";

interface JoinCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledCode?: string;
}

function JoinCommunityForm({
  onClose,
  prefilledCode = "",
}: {
  onClose: () => void;
  prefilledCode?: string;
}) {
  const [code, setCode] = useState(prefilledCode);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const navigate = useNavigate();
  const joinMutation = useJoinCommunity();

  const handleJoin = async (joinCodeToUse?: string) => {
    const rawCode = (joinCodeToUse ?? code).trim().toUpperCase();
    if (rawCode.length !== 8) {
      setError("Join code must be exactly 8 alphanumeric characters.");
      return;
    }

    setError(null);
    try {
      const enrolled = await joinMutation.mutateAsync({ joinCode: rawCode });
      toast.success(`Successfully joined "${enrolled.name}"!`);
      onClose();
      setCode("");
      startTransition(() => {
        navigate(`/communities/${enrolled.slug}`);
      });
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Invalid or expired join code. Please verify and try again.",
      );
      setError(message);
      toast.error(message);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text").trim().toUpperCase();
    if (pastedText.length === 8) {
      e.preventDefault();
      setCode(pastedText);
      handleJoin(pastedText);
    }
  };

  return (
    <>
      <div className="space-y-4 py-2">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <Field>
          <FieldLabel htmlFor="joinCode">Invitation Code</FieldLabel>
          <Input
            id="joinCode"
            placeholder="e.g. 9ABCDEF4"
            value={code}
            onChange={(e) => {
              setError(null);
              setCode(e.target.value.toUpperCase());
            }}
            onPaste={handlePaste}
            maxLength={8}
            className="text-center font-mono text-lg tracking-widest uppercase font-bold"
            autoFocus
          />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={() => handleJoin()}
          disabled={joinMutation.isPending || code.trim().length !== 8}
          className="font-bold cursor-pointer"
        >
          {joinMutation.isPending ? "Joining..." : "Join Community"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function JoinCommunityModal({
  open,
  onOpenChange,
  prefilledCode = "",
}: JoinCommunityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Community</DialogTitle>
          <DialogDescription>
            Enter an 8-character invitation code to join a community.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <JoinCommunityForm
            onClose={() => onOpenChange(false)}
            prefilledCode={prefilledCode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
