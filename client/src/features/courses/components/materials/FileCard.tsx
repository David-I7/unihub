import { useState } from "react";
import { UserAvatar } from "@/components/app/UserAvatar";
import { MaterialItemActions } from "./MaterialItemActions";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";
import { formatBytes, getFileIcon, setDragItem } from "./materialsUtils";
import type { CourseMaterialFile } from "../../api/types";

interface FileCardProps {
  file: CourseMaterialFile;
  canEdit: boolean;
  canDelete: boolean;
  canMoveUp: boolean;
  onOpen: (file: CourseMaterialFile) => void;
  onMoveUp: () => void;
}

export function FileCard({
  file,
  canEdit,
  canDelete,
  canMoveUp,
  onOpen,
  onMoveUp,
}: FileCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div
        draggable={canEdit}
        onDragStart={(e) =>
          setDragItem(e, {
            itemType: "file",
            id: file.id,
            title: file.title,
          })
        }
        onClick={() => onOpen(file)}
        className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            {getFileIcon(file.mediaType)}
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {file.title}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{file.owner?.username ?? "deleted_user"}</span>
              <span>•</span>
              <span>{new Date(file.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{formatBytes(file.size)}</span>
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
        material={{ type: "file", data: file }}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteMaterialDialog
        material={{ type: "file", data: file }}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
