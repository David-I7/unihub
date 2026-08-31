import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Download,
  FolderOpen,
  Copy,
  Check,
  Calendar,
  User,
  HardDrive,
  Info,
  Edit2,
  Trash2,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/app/UserAvatar";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/api/types";
import { getMaterialDownloadUrl } from "../../api/getMaterialDownloadUrl";
import { EditMaterialModal } from "./EditMaterialModal";
import { EditFolderModal } from "./EditFolderModal";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { MaterialFilePreviewDialog } from "./MaterialFilePreviewDialog";
import {
  formatBytes,
  getFileCategory,
  getFileIcon,
  getLinkIcon,
} from "./materialsUtils";
import type {
  CourseMaterialFile,
  CourseMaterialFolder,
  CourseMaterialLink,
} from "../../api/types";

export type SelectedMaterial =
  | { type: "file"; data: CourseMaterialFile }
  | { type: "link"; data: CourseMaterialLink }
  | {
      type: "folder";
      data: CourseMaterialFolder;
      childrenCount?: { folders: number; files: number; links: number };
    }
  | null;

interface MaterialDetailViewerProps {
  material: SelectedMaterial;
  filePath?: string;
  communitySlug?: string;
  onOpenFolder?: (folder: CourseMaterialFolder) => void;
  onDeleted?: () => void;
  onUpdated?: (updated: SelectedMaterial) => void;
  className?: string;
}

export function MaterialDetailViewer({
  material,
  filePath,
  communitySlug = "",
  onOpenFolder,
  onDeleted,
  onUpdated,
  className = "",
}: MaterialDetailViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editMaterialOpen, setEditMaterialOpen] = useState(false);
  const [deleteMaterialOpen, setDeleteMaterialOpen] = useState(false);
  const [editFolderOpen, setEditFolderOpen] = useState(false);
  const [deleteFolderOpen, setDeleteFolderOpen] = useState(false);

  const {
    canEditMaterial,
    canDeleteMaterial,
    canEditFolder,
    canDeleteFolder,
    hasPermission,
  } = usePermissions(communitySlug);

  const isFolderModerator = hasPermission(PERMISSIONS.MODERATE_FOLDER);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = async (materialId: string) => {
    try {
      setIsDownloading(true);
      const { downloadUrl } = await getMaterialDownloadUrl(materialId);
      window.open(downloadUrl, "_blank");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to retrieve download URL."));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!material) {
    return (
      <div
        className={`flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center ${className}`}
      >
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
          <Info className="size-6" />
        </div>
        <h3 className="font-heading text-sm font-semibold text-foreground">
          No Item Selected
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs mt-1">
          Select a file, external link, or folder to view its details and
          actions.
        </p>
      </div>
    );
  }

  const ownerId = material.data.owner?.id;
  const userCanEdit =
    material.type === "folder"
      ? canEditFolder(ownerId)
      : canEditMaterial(ownerId);
  const userCanDelete =
    material.type === "folder"
      ? canDeleteFolder(ownerId)
      : canDeleteMaterial(ownerId);

  return (
    <div className={`space-y-4 ${className}`}>
      {material.type === "file" && (
        <div className="space-y-6">
          {/* File Header */}
          <Card className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {getFileIcon(material.data.mediaType)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {getFileCategory(material.data.mediaType)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(material.data.size)}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground break-words">
                    {material.data.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-xs font-semibold cursor-pointer"
                onClick={() => setPreviewOpen(true)}
              >
                <Eye className="size-4 text-primary" />
                <span>Preview File</span>
              </Button>

              <Button
                size="sm"
                className="gap-2 font-bold cursor-pointer"
                disabled={isDownloading}
                onClick={() => handleDownloadFile(material.data.id)}
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Preparing Download...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span>Download File</span>
                  </>
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-xs cursor-pointer"
                onClick={() => handleCopy(material.data.title)}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Title</span>
                  </>
                )}
              </Button>

              {userCanEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => setEditMaterialOpen(true)}
                >
                  <Edit2 className="size-3.5" />
                  <span>Edit</span>
                </Button>
              )}

              {userCanDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => setDeleteMaterialOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </Card>

          {/* Description / Notes */}
          {material.data.description && (
            <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3.5 text-primary" />
                <span>Description & Notes</span>
              </h3>
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                {material.data.description}
              </p>
            </Card>
          )}

          {/* Metadata Specifications Grid */}
          <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2.5">
              File Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <HardDrive className="size-3" /> Media Type / MIME
                </span>
                <p className="font-mono text-xs font-semibold text-foreground truncate">
                  {material.data.mediaType}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Calendar className="size-3" /> Upload Date
                </span>
                <p className="font-medium text-foreground">
                  {new Date(material.data.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>

              <div className="space-y-1 sm:col-span-2 pt-1 border-t">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <User className="size-3" /> Uploaded By
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <UserAvatar
                    username={material.data.owner.username}
                    className="size-5 rounded-md text-[10px]"
                    fallbackClassName="rounded-md"
                  />
                  <span className="font-semibold text-foreground">
                    {material.data.owner.username}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {material.type === "link" && (
        <div className="space-y-6">
          {/* Link Header */}
          <Card className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {getLinkIcon(material.data.linkType)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {material.data.linkType}
                    </Badge>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground break-words">
                    {material.data.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              <Button
                size="sm"
                className="gap-2 font-bold cursor-pointer"
                onClick={() => window.open(material.data.url, "_blank")}
              >
                <span>Open Link</span>
                <ExternalLink className="size-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-xs cursor-pointer"
                onClick={() => handleCopy(material.data.url)}
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    <span>URL Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </Button>

              {userCanEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => setEditMaterialOpen(true)}
                >
                  <Edit2 className="size-3.5" />
                  <span>Edit</span>
                </Button>
              )}

              {userCanDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => setDeleteMaterialOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </Card>

          {/* Description / Notes */}
          {material.data.description && (
            <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Info className="size-3.5 text-primary" />
                <span>Description</span>
              </h3>
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                {material.data.description}
              </p>
            </Card>
          )}

          {/* Creator Metadata */}
          <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2.5">
              Resource Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Calendar className="size-3" /> Added On
                </span>
                <p className="font-medium text-foreground">
                  {new Date(material.data.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <User className="size-3" /> Shared By
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <UserAvatar
                    username={material.data.owner.username}
                    className="size-5 rounded-md text-[10px]"
                    fallbackClassName="rounded-md"
                  />
                  <span className="font-semibold text-foreground">
                    {material.data.owner.username}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {material.type === "folder" && (
        <div className="space-y-6">
          <Card className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderOpen className="size-6" />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Folder Directory
                  </Badge>
                  <h2 className="font-heading text-lg font-bold text-foreground break-words">
                    {material.data.name}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              {onOpenFolder && (
                <Button
                  size="sm"
                  className="gap-2 font-bold cursor-pointer"
                  onClick={() => onOpenFolder(material.data)}
                >
                  <FolderOpen className="size-4" />
                  <span>Open Folder Directory</span>
                </Button>
              )}

              {userCanEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => setEditFolderOpen(true)}
                >
                  <Edit2 className="size-3.5" />
                  <span>Rename</span>
                </Button>
              )}

              {userCanDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => setDeleteFolderOpen(true)}
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </Card>

          {material.childrenCount && (
            <div className="grid grid-cols-3 gap-3">
              <Card className="rounded-2xl border bg-card p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Subfolders
                </span>
                <p className="font-heading text-lg font-bold text-foreground mt-1">
                  {material.childrenCount.folders}
                </p>
              </Card>
              <Card className="rounded-2xl border bg-card p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Files
                </span>
                <p className="font-heading text-lg font-bold text-foreground mt-1">
                  {material.childrenCount.files}
                </p>
              </Card>
              <Card className="rounded-2xl border bg-card p-4 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Links
                </span>
                <p className="font-heading text-lg font-bold text-foreground mt-1">
                  {material.childrenCount.links}
                </p>
              </Card>
            </div>
          )}

          <Card className="rounded-2xl border bg-card p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-2.5">
              Directory Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Calendar className="size-3" /> Created
                </span>
                <p className="font-medium text-foreground">
                  {new Date(material.data.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <User className="size-3" /> Created By
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  <UserAvatar
                    username={material.data.owner.username}
                    className="size-5 rounded-md text-[10px]"
                    fallbackClassName="rounded-md"
                  />
                  <span className="font-semibold text-foreground">
                    {material.data.owner.username}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit & Delete Dialogs for Materials */}
      {material.type !== "folder" && (
        <>
          <EditMaterialModal
            material={material}
            open={editMaterialOpen}
            onOpenChange={setEditMaterialOpen}
            onSuccess={(updated) => {
              if (material.type === "file") {
                onUpdated?.({
                  type: "file",
                  data: updated as CourseMaterialFile,
                });
              } else {
                onUpdated?.({
                  type: "link",
                  data: updated as CourseMaterialLink,
                });
              }
            }}
          />
          <DeleteMaterialDialog
            material={material}
            open={deleteMaterialOpen}
            onOpenChange={setDeleteMaterialOpen}
            onSuccess={() => {
              onDeleted?.();
            }}
          />
          <MaterialFilePreviewDialog
            file={material.type === "file" ? material.data : null}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        </>
      )}

      {/* Edit & Delete Dialogs for Folders */}
      {material.type === "folder" && (
        <>
          <EditFolderModal
            folder={material.data}
            open={editFolderOpen}
            onOpenChange={setEditFolderOpen}
            onSuccess={(updatedFolder) => {
              onUpdated?.({
                type: "folder",
                data: updatedFolder,
                childrenCount: material.childrenCount,
              });
            }}
          />
          <DeleteFolderDialog
            folder={material.data}
            isModerator={isFolderModerator}
            open={deleteFolderOpen}
            onOpenChange={setDeleteFolderOpen}
            onSuccess={() => {
              onDeleted?.();
            }}
          />
        </>
      )}
    </div>
  );
}
