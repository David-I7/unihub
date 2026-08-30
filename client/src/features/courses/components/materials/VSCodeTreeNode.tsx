import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useCourseMaterials } from "../../api/getCourseMaterials";
import { getFileIcon, getLinkIcon } from "./materialsUtils";
import type {
  CourseMaterialFile,
  CourseMaterialFolder,
  CourseMaterialLink,
} from "../../api/types";
import type { SelectedMaterial } from "./MaterialDetailViewer";

interface VSCodeTreeNodeProps {
  folder: CourseMaterialFolder;
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  selectedMaterial: SelectedMaterial;
  onSelect: (material: SelectedMaterial, filePath: string) => void;
  parentPath?: string;
  depth?: number;
}

export function VSCodeTreeNode({
  folder,
  communitySlug,
  studyYearSlug,
  courseSlug,
  selectedMaterial,
  onSelect,
  parentPath = "Root",
  depth = 0,
}: VSCodeTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentFolderPath = `${parentPath} / ${folder.name}`;

  const { data, isLoading } = useCourseMaterials(
    communitySlug,
    studyYearSlug,
    courseSlug,
    isOpen ? folder.id : undefined,
  );

  const isFolderSelected =
    selectedMaterial?.type === "folder" && selectedMaterial.data.id === folder.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
    onSelect(
      {
        type: "folder",
        data: folder,
        childrenCount: data
          ? {
              folders: data.folders.length,
              files: data.files.length,
              links: data.links.length,
            }
          : undefined,
      },
      currentFolderPath,
    );
  };

  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const links = data?.links ?? [];

  return (
    <div className="select-none text-xs font-mono">
      {/* Folder Row */}
      <button
        type="button"
        onClick={handleToggle}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`flex w-full items-center gap-1.5 py-1 pr-2 text-left rounded-md transition-colors cursor-pointer ${
          isFolderSelected
            ? "bg-primary/15 text-primary font-semibold"
            : "hover:bg-muted/60 text-foreground/90"
        }`}
      >
        <span className="shrink-0 text-muted-foreground">
          {isOpen ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </span>

        {isOpen ? (
          <FolderOpen className="size-4 text-primary shrink-0" />
        ) : (
          <Folder className="size-4 text-primary shrink-0" />
        )}

        <span className="truncate flex-1">{folder.name}</span>

        {isLoading && <Spinner className="size-3 shrink-0 text-muted-foreground animate-spin" />}
      </button>

      {/* Children Nodes (When Expanded) */}
      {isOpen && (
        <div className="space-y-0.5">
          {/* Subfolders */}
          {folders.map((subfolder) => (
            <VSCodeTreeNode
              key={subfolder.id}
              folder={subfolder}
              communitySlug={communitySlug}
              studyYearSlug={studyYearSlug}
              courseSlug={courseSlug}
              selectedMaterial={selectedMaterial}
              onSelect={onSelect}
              parentPath={currentFolderPath}
              depth={depth + 1}
            />
          ))}

          {/* Files */}
          {files.map((file: CourseMaterialFile) => {
            const isSelected =
              selectedMaterial?.type === "file" &&
              selectedMaterial.data.id === file.id;
            const filePath = `${currentFolderPath} / ${file.title}`;

            return (
              <button
                key={file.id}
                type="button"
                onClick={() =>
                  onSelect({ type: "file", data: file }, filePath)
                }
                style={{ paddingLeft: `${(depth + 1) * 14 + 16}px` }}
                className={`flex w-full items-center gap-2 py-1 pr-2 text-left rounded-md transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/15 text-primary font-semibold"
                    : "hover:bg-muted/60 text-foreground/80"
                }`}
              >
                {getFileIcon(file.mediaType)}
                <span className="truncate flex-1">{file.title}</span>
              </button>
            );
          })}

          {/* Links */}
          {links.map((link: CourseMaterialLink) => {
            const isSelected =
              selectedMaterial?.type === "link" &&
              selectedMaterial.data.id === link.id;
            const linkPath = `${currentFolderPath} / ${link.title}`;

            return (
              <button
                key={link.id}
                type="button"
                onClick={() =>
                  onSelect({ type: "link", data: link }, linkPath)
                }
                style={{ paddingLeft: `${(depth + 1) * 14 + 16}px` }}
                className={`flex w-full items-center gap-2 py-1 pr-2 text-left rounded-md transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary/15 text-primary font-semibold"
                    : "hover:bg-muted/60 text-foreground/80"
                }`}
              >
                {getLinkIcon(link.linkType)}
                <span className="truncate flex-1">{link.title}</span>
              </button>
            );
          })}

          {/* Empty folder indicator */}
          {!isLoading &&
            folders.length === 0 &&
            files.length === 0 &&
            links.length === 0 && (
              <div
                style={{ paddingLeft: `${(depth + 1) * 14 + 20}px` }}
                className="py-1 text-[11px] text-muted-foreground/60 italic"
              >
                (empty directory)
              </div>
            )}
        </div>
      )}
    </div>
  );
}
