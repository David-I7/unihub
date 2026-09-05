import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useUpdateCommunityMemberRole } from "../../api/updateCommunityMemberRole";
import type { CommunityMember, CommunityMemberRole } from "../../api/types";

type MemberRoleUi = "Member" | "Admin";

const ROLE_UI_TO_SERVER: Record<MemberRoleUi, CommunityMemberRole> = {
  Member: "COMMUNITY_MEMBER",
  Admin: "COMMUNITY_ADMIN",
};

interface ChangeMemberRoleModalProps {
  member: CommunityMember | null;
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangeMemberRoleModal({
  member,
  communitySlug,
  open,
  onOpenChange,
}: ChangeMemberRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<MemberRoleUi>("Member");
  const updateMutation = useUpdateCommunityMemberRole();

  useEffect(() => {
    if (member) {
      setSelectedRole(member.role === "COMMUNITY_ADMIN" ? "Admin" : "Member");
    }
  }, [member, open]);

  if (!member) return null;

  const currentRoleUi: MemberRoleUi =
    member.role === "COMMUNITY_ADMIN" ? "Admin" : "Member";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const serverRole = ROLE_UI_TO_SERVER[selectedRole];

    if (serverRole === member.role) {
      onOpenChange(false);
      return;
    }

    try {
      await updateMutation.mutateAsync({
        communitySlug,
        username: member.username,
        payload: { role: serverRole },
      });

      toast.success(`Role for @${member.username} updated to ${selectedRole}.`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update member role."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
          <DialogDescription>
            Update permissions and access level for{" "}
            <strong className="text-foreground font-semibold">
              {member.username}
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field>
            <FieldLabel htmlFor="changeRole">Assigned Role</FieldLabel>
            <Select
              value={selectedRole}
              onValueChange={(val: string | null) => {
                if (val === "Member" || val === "Admin") {
                  setSelectedRole(val);
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
                    <span>Member (Standard access)</span>
                  </div>
                </SelectItem>
                <SelectItem value="Admin">
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="size-3.5 text-muted-foreground" />
                    <span>Admin (Manage members & courses)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription className="text-xs text-muted-foreground">
              Community Admins can add members, manage courses, and update
              settings.
            </FieldDescription>
          </Field>

          <DialogFooter className="pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                updateMutation.isPending || selectedRole === currentRoleUi
              }
            >
              {updateMutation.isPending ? "Saving..." : "Save Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
