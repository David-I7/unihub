import { useState } from "react";
import { MaterialItemActions } from "./MaterialItemActions";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";
import { getLinkIcon, setDragItem } from "./materialsUtils";
import type { CourseMaterialLink } from "../../api/types";

interface LinkCardProps {
  link: CourseMaterialLink;
  canEdit: boolean;
  canDelete: boolean;
  canMoveUp: boolean;
  onOpen: (link: CourseMaterialLink) => void;
  onMoveUp: () => void;
}

export function LinkCard({
  link,
  canEdit,
  canDelete,
  canMoveUp,
  onOpen,
  onMoveUp,
}: LinkCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div
        draggable={canEdit}
        onDragStart={(e) =>
          setDragItem(e, {
            itemType: "link",
            id: link.id,
            title: link.title,
          })
        }
        onClick={() => onOpen(link)}
        className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
            {getLinkIcon(link.linkType)}
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {link.title}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{link.owner?.username ?? "deleted_user"}</span>
              <span>•</span>
              <span>{new Date(link.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <MaterialItemActions
            canEdit={canEdit}
            canDelete={canDelete}
            canMoveUp={canMoveUp}
            onEdit={() => setIsEditOpen(true)}
            onMoveUp={onMoveUp}
            onDelete={() => setIsDeleteOpen(true)}
          />
        </div>
      </div>

      <EditMaterialModal
        material={{ type: "link", data: link }}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteMaterialDialog
        material={{ type: "link", data: link }}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
