import { useState } from "react";
import {
  Folder,
  FileText,
  ExternalLink,
  ChevronRight,
  Download,
  FolderOpen,
  Globe,
  FileCode,
  FileArchive,
  Image,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseMaterials } from "../api/getCourseMaterials";
import type { CourseMaterialFolder } from "../api/types";

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface CourseMaterialsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseId: number | string;
}

function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileIcon(mediaType: string) {
  if (mediaType.includes("pdf")) return <FileText className="size-4 text-rose-500" />;
  if (mediaType.includes("image")) return <Image className="size-4 text-blue-500" />;
  if (mediaType.includes("zip") || mediaType.includes("tar") || mediaType.includes("rar"))
    return <FileArchive className="size-4 text-amber-500" />;
  if (mediaType.includes("javascript") || mediaType.includes("typescript") || mediaType.includes("json"))
    return <FileCode className="size-4 text-emerald-500" />;
  return <FileText className="size-4 text-muted-foreground" />;
}

function getLinkIcon(linkType: string) {
  if (linkType.toUpperCase() === "GITHUB") return <GitBranch className="size-4 text-foreground" />;
  return <Globe className="size-4 text-primary" />;
}

export function CourseMaterialsTab({
  communitySlug,
  studyYearSlug,
  courseId,
}: CourseMaterialsTabProps) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Root" },
  ]);

  const currentFolder = breadcrumbs[breadcrumbs.length - 1];
  const currentFolderId = currentFolder.id ?? undefined;

  const {
    data: materials,
    isLoading,
    isError,
    refetch,
  } = useCourseMaterials(
    communitySlug,
    studyYearSlug,
    courseId,
    currentFolderId,
  );

  const handleOpenFolder = (folder: CourseMaterialFolder) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  const folders = materials?.folders ?? [];
  const files = materials?.files ?? [];
  const links = materials?.links ?? [];
  const isEmpty = folders.length === 0 && files.length === 0 && links.length === 0;

  return (
    <div className="space-y-6">
      {/* Folder Breadcrumb Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <FolderOpen className="size-4 text-primary shrink-0 mr-1" />
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <div key={item.id ?? "root"} className="flex items-center gap-1.5 shrink-0">
              {index > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50" />}
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
              No files, links, or subfolders have been added to this location yet.
            </p>
          </div>
        </div>
      )}

      {/* Materials List */}
      {!isLoading && !isError && !isEmpty && (
        <div className="space-y-6">
          {/* Folders Section */}
          {folders.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Folder className="size-3.5 text-primary" /> Folders ({folders.length})
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
                      <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {folder.name}
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files Section */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5 text-primary" /> Files ({files.length})
              </h3>
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card p-3.5 shadow-2xs hover:border-border transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getFileIcon(file.mediaType)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {file.title}
                        </p>
                        {file.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {file.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-0.5">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>Uploaded by {file.owner.username}</span>
                          <span>•</span>
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      size="xs"
                      variant="outline"
                      className="gap-1.5 shrink-0 self-start sm:self-center font-semibold cursor-pointer"
                      onClick={() => {
                        // Action for file download or viewing
                      }}
                    >
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links Section */}
          {links.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ExternalLink className="size-3.5 text-primary" /> External Resources & Links ({links.length})
              </h3>
              <div className="space-y-2">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border bg-card p-3.5 shadow-2xs hover:border-primary/50 transition-all no-underline"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                        {getLinkIcon(link.linkType)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                            {link.title}
                          </p>
                          <Badge variant="secondary" className="text-[10px] font-mono py-0 px-1.5">
                            {link.linkType}
                          </Badge>
                        </div>
                        {link.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {link.description}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/80 truncate">
                          {link.url}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0 self-start sm:self-center">
                      <span>Open Link</span>
                      <ExternalLink className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
