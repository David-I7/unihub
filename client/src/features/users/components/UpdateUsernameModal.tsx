import * as React from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { usernameSchema } from "@/features/auth/schemas/authSchemas";
import { useUpdateProfile } from "../api/updateProfile";
import { Pencil } from "lucide-react";

export interface UpdateUsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
}

interface UpdateUsernameFormProps {
  currentUsername: string;
  onClose: () => void;
}

function UpdateUsernameForm({
  currentUsername,
  onClose,
}: UpdateUsernameFormProps) {
  const [username, setUsername] = React.useState(currentUsername);
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const { mutateAsync: updateProfileMutation, isPending } = useUpdateProfile();
  const isUnchanged = username.trim() === currentUsername.trim();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldError(null);
    setServerError(null);

    const trimmed = username.trim();
    if (trimmed === currentUsername.trim()) {
      onClose();
      return;
    }

    const result = usernameSchema.safeParse(trimmed);
    if (!result.success) {
      setFieldError(
        result.error.issues[0]?.message || "Please enter a valid username.",
      );
      return;
    }

    try {
      await updateProfileMutation({ username: trimmed });
      toast.success("Username updated successfully.");
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setFieldError("Username is already taken.");
      } else {
        setServerError(getErrorMessage(err, "Failed to update username."));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
      {serverError && (
        <FieldError className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-center text-xs">
          {serverError}
        </FieldError>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-username" className="text-xs font-medium">
          New username
        </Label>
        <Input
          id="new-username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldError) setFieldError(null);
            if (serverError) setServerError(null);
          }}
          placeholder="Enter new username"
          autoComplete="username"
          autoFocus
          disabled={isPending}
          aria-invalid={Boolean(fieldError)}
        />
        {fieldError && (
          <FieldError className="text-xs">{fieldError}</FieldError>
        )}
        <p className="text-[11px] text-muted-foreground">
          Must be 3-30 characters with letters, numbers, underscores, or
          hyphens.
        </p>
      </div>

      <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || isUnchanged || !username.trim()}
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UpdateUsernameModal({
  open,
  onOpenChange,
  currentUsername,
}: UpdateUsernameModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Pencil className="size-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold font-heading">
            Update username
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground text-balance">
            Choose a new username for your account. This will update your
            profile across UniHub.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <UpdateUsernameForm
            currentUsername={currentUsername}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UpdateUsernameModal;
