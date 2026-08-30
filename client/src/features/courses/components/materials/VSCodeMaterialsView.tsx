import { useState, useMemo } from "react";
import { FolderTree, RotateCw, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCourseMaterials } from "../../api/getCourseMaterials";
import { VSCodeTreeNode } from "./VSCodeTreeNode";
import {
  MaterialDetailViewer,
  type SelectedMaterial,
} from "./MaterialDetailViewer";
import { getFileIcon, getLinkIcon } from "./materialsUtils";
import type { CourseMaterialFile, CourseMaterialLink } from "../../api/types";

interface VSCodeMaterialsViewProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

export function VSCodeMaterialsView({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: VSCodeMaterialsViewProps) {
  const [selectedMaterial, setSelectedMaterial] =
    useState<SelectedMaterial>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");

  const {
    data: rootMaterials,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useCourseMaterials(communitySlug, studyYearSlug, courseSlug, undefined);

  const handleSelectMaterial = (
    material: SelectedMaterial,
    filePath: string,
  ) => {
    setSelectedMaterial(material);
    setSelectedFilePath(filePath);
  };

  const folders = useMemo(() => rootMaterials?.folders ?? [], [rootMaterials]);
  const files = useMemo(() => rootMaterials?.files ?? [], [rootMaterials]);
  const links = useMemo(() => rootMaterials?.links ?? [], [rootMaterials]);

  const isRootEmpty =
    folders.length === 0 && files.length === 0 && links.length === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
      {/* Left Column: VS Code File Tree Explorer (5 cols on md/lg) */}
      <Card className="md:col-span-5 lg:col-span-4 rounded-2xl border bg-card/70 shadow-xs flex flex-col min-h-[460px] overflow-hidden">
        {/* Explorer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40 text-xs select-none">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-muted-foreground">
            <FolderTree className="size-3.5 text-primary" />
            <span>Explorer</span>
          </div>

          <Button
            size="xs"
            variant="ghost"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh Explorer"
          >
            <RotateCw
              className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* Tree Content */}
        <div className="p-2 space-y-1 flex-1 overflow-y-auto max-h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-xs text-muted-foreground">
              <Spinner className="size-4 animate-spin" />
              <span>Loading workspace...</span>
            </div>
          ) : isError ? (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-destructive font-medium">
                Failed to load materials tree.
              </p>
              <Button
                size="xs"
                variant="outline"
                onClick={() => refetch()}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          ) : isRootEmpty ? (
            <div className="p-8 text-center space-y-2">
              <FolderOpen className="size-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No materials in this course yet.
              </p>
            </div>
          ) : (
            <div className="space-y-0.5 font-mono text-xs">
              {/* Folders */}
              {folders.map((folder) => (
                <VSCodeTreeNode
                  key={folder.id}
                  folder={folder}
                  communitySlug={communitySlug}
                  studyYearSlug={studyYearSlug}
                  courseSlug={courseSlug}
                  selectedMaterial={selectedMaterial}
                  onSelect={handleSelectMaterial}
                  parentPath="Root"
                  depth={0}
                />
              ))}

              {/* Root Files */}
              {files.map((file: CourseMaterialFile) => {
                const isSelected =
                  selectedMaterial?.type === "file" &&
                  selectedMaterial.data.id === file.id;
                const filePath = `Root / ${file.title}`;

                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() =>
                      handleSelectMaterial(
                        { type: "file", data: file },
                        filePath,
                      )
                    }
                    className={`flex w-full items-center gap-2 px-2 py-1 text-left rounded-md transition-colors cursor-pointer ${
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

              {/* Root Links */}
              {links.map((link: CourseMaterialLink) => {
                const isSelected =
                  selectedMaterial?.type === "link" &&
                  selectedMaterial.data.id === link.id;
                const linkPath = `Root / ${link.title}`;

                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() =>
                      handleSelectMaterial(
                        { type: "link", data: link },
                        linkPath,
                      )
                    }
                    className={`flex w-full items-center gap-2 px-2 py-1 text-left rounded-md transition-colors cursor-pointer ${
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
            </div>
          )}
        </div>
      </Card>

      {/* Right Column: Shared Material Detail Viewer (7 cols on md/lg) */}
      <div className="md:col-span-7 lg:col-span-8">
        <MaterialDetailViewer
          material={selectedMaterial}
          filePath={selectedFilePath}
        />
      </div>
    </div>
  );
}
