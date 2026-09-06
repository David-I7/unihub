import { useState } from "react";
import { FolderOpen, ChevronRight } from "lucide-react";
import { getDraggedItem, type DraggedItemData } from "./materialsUtils";
import type { SelectedMaterial } from "./MaterialDetailViewer";

export interface BreadcrumbItem {
  id: string | null;
  name: string;
  type: "folder" | "file" | "link";
  material?: SelectedMaterial;
}

interface MaterialsBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  isArchived?: boolean;
  onNavigate: (index: number) => void;
  onDropIntoFolder: (
    dragged: DraggedItemData,
    targetFolderId: string | null,
    targetFolderName: string,
  ) => void;
}

export function MaterialsBreadcrumbs({
  breadcrumbs,
  isArchived = false,
  onNavigate,
  onDropIntoFolder,
}: MaterialsBreadcrumbsProps) {
  const [dragOverBreadcrumbId, setDragOverBreadcrumbId] = useState<
    string | null
  >(null);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none rounded-xl border bg-card px-4 py-2.5 text-xs text-muted-foreground">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isBreadcrumbDropTarget =
          !isLast &&
          item.type === "folder" &&
          dragOverBreadcrumbId === (item.id ?? "root");

        return (
          <div
            key={item.id ?? `root-${index}`}
            className="flex items-center gap-1.5 shrink-0"
          >
            {index > 0 && (
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
            )}
            <button
              type="button"
              onClick={() => onNavigate(index)}
              onDragOver={(e) => {
                if (!isArchived && !isLast && item.type === "folder") {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverBreadcrumbId(item.id ?? "root");
                }
              }}
              onDragLeave={() => setDragOverBreadcrumbId(null)}
              onDrop={(e) => {
                if (!isArchived && !isLast && item.type === "folder") {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverBreadcrumbId(null);
                  const dragged = getDraggedItem(e);
                  if (dragged) {
                    onDropIntoFolder(dragged, item.id, item.name);
                  }
                }
              }}
              className={`inline-flex items-center gap-1 font-semibold transition-all cursor-pointer px-1.5 py-0.5 rounded-md ${
                isBreadcrumbDropTarget
                  ? "bg-primary/20 text-primary ring-2 ring-primary"
                  : isLast
                    ? "text-foreground font-bold cursor-default"
                    : "hover:text-foreground text-muted-foreground"
              }`}
              disabled={isLast}
            >
              {index === 0 && (
                <FolderOpen className="size-4 text-primary shrink-0" />
              )}
              <span>{item.name}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
