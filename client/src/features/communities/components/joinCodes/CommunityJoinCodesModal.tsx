import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { JoinCodesTab } from "./JoinCodesTab";
import type { Community } from "../../api/types";

interface CommunityJoinCodesModalProps {
  community: Community;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunityJoinCodesModal({
  community,
  open,
  onOpenChange,
}: CommunityJoinCodesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invitation Codes</DialogTitle>
          <DialogDescription>
            Manage invite codes and shareable access links for {community.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2">
          <JoinCodesTab communitySlug={community.slug} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
