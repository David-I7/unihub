import { useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Shield, User } from "@/components/ui/icons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useForm } from "@/hooks/useForm";
import { useAddCommunityMember } from "../../api/addCommunityMember";
import type { CommunityMemberRole } from "../../api/types";

type MemberRoleUi = "Member" | "Admin";

const ROLE_UI_TO_SERVER: Record<MemberRoleUi, CommunityMemberRole> = {
  Member: "COMMUNITY_MEMBER",
  Admin: "COMMUNITY_ADMIN",
};

type AddMemberFormValues = {
  username: string;
  role: MemberRoleUi;
};

const addMemberSchema: z.ZodType<AddMemberFormValues> = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be under 50 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, underscores, dots, and hyphens",
    ),
  role: z.enum(["Member", "Admin"]),
});

interface AddMemberModalProps {
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canAssignAdmin?: boolean;
}

export function AddMemberModal({
  communitySlug,
  open,
  onOpenChange,
  canAssignAdmin = false,
}: AddMemberModalProps) {
  const addMutation = useAddCommunityMember();

  const form = useForm<AddMemberFormValues>({
    initialValues: {
      username: "",
      role: "Member",
    },
    schema: addMemberSchema,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        const serverRole: CommunityMemberRole =
          ROLE_UI_TO_SERVER[values.role] ?? "COMMUNITY_MEMBER";

        await addMutation.mutateAsync({
          communitySlug,
          payload: {
            username: values.username.trim(),
            role: serverRole,
          },
        });

        toast.success(`Member @${values.username.trim()} added successfully!`);
        onOpenChange(false);
      } catch (err: unknown) {
        const message = getErrorMessage(err, "Failed to add member.");
        toast.error(message);
        form.setServerError(message);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: "",
        role: "Member",
      });
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Community Member</DialogTitle>
          <DialogDescription>
            Directly enroll a user into this community by their username.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4 pt-2">
          {form.serverError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              {form.serverError}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="username">Username *</FieldLabel>
            <Input
              id="username"
              name="username"
              placeholder="e.g. johndoe"
              value={form.values.username}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              aria-invalid={form.isInvalid("username")}
              autoComplete="off"
            />
            <FieldDescription>
              Enter the exact username of the user you want to add.
            </FieldDescription>
            <FieldError errors={[{ message: form.errors.username }]} />
          </Field>

          {canAssignAdmin && (
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select
                value={form.values.role}
                onValueChange={(val: string | null) => {
                  if (val === "Member" || val === "Admin") {
                    form.setValue("role", val);
                  }
                }}
              >
                <SelectTrigger className="h-8 text-xs rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="size-3.5 text-muted-foreground" />
                      <span>Member</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="size-3.5 text-primary" />
                      <span>Admin</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                Community Admins can manage courses, study years, and members.
              </FieldDescription>
            </Field>
          )}

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.isSubmitting || addMutation.isPending}
              className="gap-1.5 font-bold cursor-pointer"
            >
              {form.isSubmitting || addMutation.isPending
                ? "Adding..."
                : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
