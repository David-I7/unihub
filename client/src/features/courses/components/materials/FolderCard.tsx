import { useState } from "react";
import { Folder } from "lucide-react";
import { MaterialItemActions } from "./MaterialItemActions";
import { EditFolderModal } from "./EditFolderModal";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import {
  setDragItem,
  getDraggedItem,
  type DraggedItemData,
} from "./materialsUtils";
import type { CourseMaterialFolder } from "../../api/types";

interface FolderCardProps {
  folder: CourseMaterialFolder;
  canEdit: boolean;
  canDelete: boolean;
  canMoveUp: boolean;
  isArchived?: boolean;
  isModerator: boolean;
  onOpen: (folder: CourseMaterialFolder) => void;
  onMoveUp: () => void;
  onDropIntoFolder: (
    dragged: DraggedItemData,
    targetFolderId: string,
    targetFolderName: string,
  ) => void;
}

export function FolderCard({
  folder,
  canEdit,
  canDelete,
  canMoveUp,
  isArchived = false,
  isModerator,
  onOpen,
  onMoveUp,
  onDropIntoFolder,
}: FolderCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <div
        draggable={canEdit}
        onDragStart={(e) =>
          setDragItem(e, {
            itemType: "folder",
            id: folder.id,
            title: folder.name,
          })
        }
        onDragOver={(e) => {
          if (!isArchived) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setIsDragOver(true);
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          if (!isArchived) {
            e.preventDefault();
            setIsDragOver(false);
            const dragged = getDraggedItem(e);
            if (dragged) {
              onDropIntoFolder(dragged, folder.id, folder.name);
            }
          }
        }}
        onClick={() => onOpen(folder)}
        className={`group flex items-center justify-between rounded-xl border bg-card p-3.5 hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer shadow-2xs ${
          isDragOver
            ? "border-primary bg-primary/10 ring-2 ring-primary/40"
            : ""
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Folder className="size-4" />
          </div>
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate block">
              {folder.name}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="truncate">{folder.owner?.username}</span>
              <span>•</span>
              <span>{new Date(folder.createdAt).toLocaleDateString()}</span>
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

      <EditFolderModal
        folder={folder}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />

      <DeleteFolderDialog
        folder={folder}
        isModerator={isModerator}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
      />
    </>
  );
}
