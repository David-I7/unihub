import * as React from "react";
import { useState, useCallback } from "react";
import { useSearchParams } from "react-router";
import { KeyRound, Plus, MoreVertical } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/hooks/usePermissions";
import { CreateCommunityModal } from "./CreateCommunityModal";
import { JoinCommunityModal } from "./JoinCommunityModal";

export interface CommunityHeaderProps {
  canCreate?: boolean;
}

function CommunityHeaderComponent({
  canCreate: customCanCreate,
}: CommunityHeaderProps) {
  const [searchParams] = useSearchParams();
  const joinCodeParam = searchParams.get("join") || "";

  const { canCreateCommunity: defaultCanCreate } = usePermissions();
  const canCreate = customCanCreate ?? defaultCanCreate;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(Boolean(joinCodeParam));

  const handleOpenCreate = useCallback(() => {
    setCreateModalOpen(true);
  }, []);

  const handleOpenJoin = useCallback(() => {
    setJoinModalOpen(true);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Communities
        </h1>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-9 rounded-xl  hover:bg-muted cursor-pointer"
                aria-label="Community actions"
              >
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
            <DropdownMenuItem
              onClick={handleOpenJoin}
              className="gap-2 text-xs font-medium cursor-pointer"
            >
              <KeyRound className="size-4 text-muted-foreground" />
              <span>Join with Code</span>
            </DropdownMenuItem>

            {canCreate && (
              <DropdownMenuItem
                onClick={handleOpenCreate}
                className="gap-2 text-xs font-medium cursor-pointer"
              >
                <Plus className="size-4 text-muted-foreground" />
                <span>Create Community</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CreateCommunityModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <JoinCommunityModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        prefilledCode={joinCodeParam}
      />
    </>
  );
}

export const CommunityHeader = React.memo(CommunityHeaderComponent);
