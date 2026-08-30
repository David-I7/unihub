import { useState } from "react";
import { Folder, ChevronRight, FolderOpen, Globe, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseMaterials } from "../../api/getCourseMaterials";
import { formatBytes, getFileIcon, getLinkIcon } from "./materialsUtils";
import {
  MaterialDetailViewer,
  type SelectedMaterial,
} from "./MaterialDetailViewer";
import type {
  CourseMaterialFolder,
  CourseMaterialFile,
  CourseMaterialLink,
} from "../../api/types";

interface BreadcrumbItem {
  id: string | null;
  name: string;
  type: "folder" | "file" | "link";
  material?: SelectedMaterial;
}

interface StandardMaterialsViewProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

export function StandardMaterialsView({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: StandardMaterialsViewProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Root", type: "folder" },
  ]);

  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const isMaterialDetail =
    currentBreadcrumb.type === "file" || currentBreadcrumb.type === "link";

  // Find the active folder ID (the last folder in the breadcrumb trail)
  const lastFolder = [...breadcrumbs]
    .reverse()
    .find((b) => b.type === "folder");
  const currentFolderId = lastFolder?.id ?? undefined;

  const {
    data: materials,
    isLoading,
    isError,
    refetch,
  } = useCourseMaterials(
    communitySlug,
    studyYearSlug,
    courseSlug,
    currentFolderId,
  );

  const handleOpenFolder = (folder: CourseMaterialFolder) => {
    setBreadcrumbs((prev) => [
      ...prev,
      { id: folder.id, name: folder.name, type: "folder" },
    ]);
  };

  const handleOpenFile = (file: CourseMaterialFile) => {
    setBreadcrumbs((prev) => [
      ...prev,
      {
        id: file.id,
        name: file.title,
        type: "file",
        material: { type: "file", data: file },
      },
    ]);
  };

  const handleOpenLink = (link: CourseMaterialLink) => {
    setBreadcrumbs((prev) => [
      ...prev,
      {
        id: link.id,
        name: link.title,
        type: "link",
        material: { type: "link", data: link },
      },
    ]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const folders = materials?.folders ?? [];
  const files = materials?.files ?? [];
  const links = materials?.links ?? [];
  const isEmpty =
    folders.length === 0 && files.length === 0 && links.length === 0;

  return (
    <div className="space-y-6">
      {/* Folder Breadcrumb Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <FolderOpen className="size-4 text-primary shrink-0 mr-1" />
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
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
                onClick={() => handleNavigateBreadcrumb(index)}
                className={`font-semibold transition-colors cursor-pointer ${
                  isLast
                    ? "text-foreground font-bold cursor-default"
                    : "hover:text-foreground text-muted-foreground"
                }`}
                disabled={isLast}
              >
                {item.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* When a material (file or link) is selected, show detail viewer directly on this path */}
      {isMaterialDetail && currentBreadcrumb.material ? (
        <MaterialDetailViewer material={currentBreadcrumb.material} />
      ) : (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border bg-card p-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-destructive">
                Failed to load course materials.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && isEmpty && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <FolderOpen className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Folder is Empty
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  No files, links, or subfolders have been added to this location
                  yet.
                </p>
              </div>
            </div>
          )}

          {/* Materials List */}
          {!isLoading && !isError && !isEmpty && (
            <div className="space-y-6">
              {/* Folders Section with Owner & Creation Date */}
              {folders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Folder className="size-3.5 text-primary" /> Folders (
                    {folders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => handleOpenFolder(folder)}
                        className="group flex items-center justify-between rounded-xl border bg-card p-3.5 hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Folder className="size-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate block">
                              {folder.name}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span className="truncate">
                                By {folder.owner?.username}
                              </span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  folder.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Files Section (Opens file detail inline under breadcrumb trail) */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-primary" /> Files (
                    {files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file: CourseMaterialFile) => (
                      <div
                        key={file.id}
                        onClick={() => handleOpenFile(file)}
                        className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                            {getFileIcon(file.mediaType)}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                              {file.title}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>{formatBytes(file.size)}</span>
                              <span>•</span>
                              <span>Uploaded by {file.owner.username}</span>
                              <span>•</span>
                              <span>
                                {new Date(file.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Section (Opens link detail inline under breadcrumb trail) */}
              {links.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Globe className="size-3.5 text-primary" /> External Links (
                    {links.length})
                  </h3>
                  <div className="space-y-2">
                    {links.map((link: CourseMaterialLink) => (
                      <div
                        key={link.id}
                        onClick={() => handleOpenLink(link)}
                        className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                            {getLinkIcon(link.linkType)}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                {link.title}
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-[10px] font-mono py-0 px-1.5"
                              >
                                {link.linkType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span>Added by {link.owner.username}</span>
                              <span>•</span>
                              <span>
                                {new Date(link.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
