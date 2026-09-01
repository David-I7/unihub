import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Download,
  Copy,
  Check,
  Calendar,
  HardDrive,
  Info,
  Edit2,
  Trash2,
  Loader2,
  Eye,
  MoreVertical,
  FileText,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/app/UserAvatar";
import { usePermissions } from "@/hooks/usePermissions";
import { getErrorMessage } from "@/api/types";
import { getMaterialDownloadUrl } from "../../api/getMaterialDownloadUrl";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";
import { MaterialFilePreviewDialog } from "./MaterialFilePreviewDialog";
import {
  formatBytes,
  getFileCategory,
  getFileIcon,
  getLinkIcon,
  getLinkTypeLabel,
} from "./materialsUtils";
import type { CourseMaterialFile, CourseMaterialLink } from "../../api/types";

export type SelectedMaterial =
  | { type: "file"; data: CourseMaterialFile }
  | { type: "link"; data: CourseMaterialLink }
  | null;

interface MaterialDetailViewerProps {
  material: SelectedMaterial;
  communitySlug?: string;
  isArchived?: boolean;
  onDeleted?: () => void;
  onUpdated?: (updated: SelectedMaterial) => void;
  className?: string;
}

export function MaterialDetailViewer({
  material,
  communitySlug = "",
  isArchived = false,
  onDeleted,
  onUpdated,
  className = "",
}: MaterialDetailViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [editMaterialOpen, setEditMaterialOpen] = useState(false);
  const [deleteMaterialOpen, setDeleteMaterialOpen] = useState(false);

  const { canEditMaterial, canDeleteMaterial } = usePermissions(communitySlug);

  const handleCopy = (text: string, label = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(label);
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
          Select a file or external link from the list to view its details and
          actions.
        </p>
      </div>
    );
  }

  const ownerId = material.data.owner?.id;
  const userCanEdit = !isArchived && canEditMaterial(ownerId);
  const userCanDelete = !isArchived && canDeleteMaterial(ownerId);

  return (
    <div className={`${className}`}>
      {/* ========================================================================= */}
      {/* 1. FILE DETAIL VIEW */}
      {/* ========================================================================= */}
      {material.type === "file" && (
        <Card className="rounded-2xl border bg-card overflow-hidden shadow-xs">
          {/* Header & Primary Actions */}
          <div className="bg-muted/30 border-b px-5 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold px-2.5 py-0.5"
                >
                  {getFileCategory(material.data.mediaType)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs font-mono px-2 py-0.5"
                >
                  {formatBytes(material.data.size)}
                </Badge>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="size-3.5 text-primary" />
                  <span>Preview</span>
                </Button>

                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
                  disabled={isDownloading}
                  onClick={() => handleDownloadFile(material.data.id)}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="size-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </Button>

                {/* Dropdown Menu for Secondary Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">More options</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() =>
                        handleCopy(material.data.title, "File name copied")
                      }
                      className="gap-2 text-xs cursor-pointer"
                    >
                      {copied ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground" />
                      )}
                      <span>Copy Name</span>
                    </DropdownMenuItem>

                    {userCanEdit && (
                      <DropdownMenuItem
                        onClick={() => setEditMaterialOpen(true)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                        <span>Edit Details</span>
                      </DropdownMenuItem>
                    )}

                    {userCanDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteMaterialOpen(true)}
                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete File</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Title & Creator Hero */}
            <div className="flex items-start gap-4 pt-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background border shadow-2xs">
                {getFileIcon(material.data.mediaType, "size-6")}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground break-words leading-snug">
                  {material.data.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar
                      username={material.data.owner.username}
                      className="size-4 rounded text-[9px]"
                      fallbackClassName="rounded"
                    />
                    <span className="font-medium text-foreground">
                      {material.data.owner.username}
                    </span>
                  </div>
                  <span>•</span>
                  <span>
                    Uploaded on{" "}
                    {new Date(material.data.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>{" "}
                </div>
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          {material.data.description ? (
            <div className="px-5 pt-2 pb-5 border-b space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Description</span>
              </h3>
              <div className="text-xs sm:text-sm text-foreground/90 ">
                {material.data.description}
              </div>
            </div>
          ) : null}

          {/* File Specifications Table */}
          <div className="px-5 pt-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              File Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <HardDrive className="size-3.5 text-muted-foreground" /> MIME
                  Type
                </span>
                <p className="font-mono text-xs font-semibold text-foreground truncate">
                  {material.data.mediaType}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Layers className="size-3.5 text-muted-foreground" /> Exact
                  File Size
                </span>
                <p className="font-medium text-foreground">
                  {material.data.size.toLocaleString()} bytes (
                  {formatBytes(material.data.size)})
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2. LINK DETAIL VIEW */}
      {/* ========================================================================= */}
      {material.type === "link" && (
        <Card className="rounded-2xl border bg-card overflow-hidden shadow-xs">
          {/* Header & Primary Actions */}
          <div className="bg-muted/30 border-b px-5 pb-5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold px-2.5 py-0.5"
                >
                  {getLinkTypeLabel(material.data.linkType)}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs font-mono px-2 py-0.5"
                >
                  {material.data.linkType}
                </Badge>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-bold cursor-pointer shadow-2xs"
                  onClick={() => window.open(material.data.url, "_blank")}
                >
                  <span>Open Resource</span>
                  <ExternalLink className="size-3.5" />
                </Button>

                {/* Dropdown Menu for Secondary Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                      />
                    }
                  >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">More options</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() =>
                        handleCopy(material.data.url, "Destination URL copied")
                      }
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <Copy className="size-3.5 text-muted-foreground" />
                      <span>Copy URL</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() =>
                        handleCopy(material.data.title, "Title copied")
                      }
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <FileText className="size-3.5 text-muted-foreground" />
                      <span>Copy Title</span>
                    </DropdownMenuItem>

                    {userCanEdit && (
                      <DropdownMenuItem
                        onClick={() => setEditMaterialOpen(true)}
                        className="gap-2 text-xs cursor-pointer"
                      >
                        <Edit2 className="size-3.5 text-muted-foreground" />
                        <span>Edit Details</span>
                      </DropdownMenuItem>
                    )}

                    {userCanDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteMaterialOpen(true)}
                          className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete Link</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Title & Creator Hero */}
            <div className="flex items-start gap-4 pt-1">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-background border shadow-2xs">
                {getLinkIcon(material.data.linkType, "size-6")}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground break-words leading-snug">
                  {material.data.title}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <UserAvatar
                      username={material.data.owner.username}
                      className="size-4 rounded text-[9px]"
                      fallbackClassName="rounded"
                    />
                    <span className="font-medium text-foreground">
                      {material.data.owner.username}
                    </span>
                  </div>
                  <span>•</span>
                  <span>
                    Added on{" "}
                    {new Date(material.data.createdAt).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {material.data.description ? (
            <div className="px-5 pb-5 border-b space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <span>Description</span>
              </h3>
              <div className="text-xs sm:text-sm text-foreground/90">
                {material.data.description}
              </div>
            </div>
          ) : null}

          {/* Resource Information Table */}
          <div className="px-5  space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resource Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Layers className="size-3.5 text-muted-foreground" /> Resource
                  Type
                </span>
                <p className="font-semibold text-foreground capitalize">
                  {getLinkTypeLabel(material.data.linkType)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border space-y-1">
                <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <Calendar className="size-3.5 text-muted-foreground" /> Added
                  On
                </span>
                <p className="font-medium text-foreground">
                  {new Date(material.data.createdAt).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 3. MODALS & DIALOGS */}
      {/* ========================================================================= */}
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
    </div>
  );
}
