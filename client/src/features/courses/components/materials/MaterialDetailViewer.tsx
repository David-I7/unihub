import { useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Download,
  Copy,
  Check,
  Calendar,
  User,
  HardDrive,
  Info,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
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
  const isFile = material.type === "file";
  const fileData = isFile ? (material.data as CourseMaterialFile) : null;
  const linkData = !isFile ? (material.data as CourseMaterialLink) : null;

  return (
    <div className={className}>
      <Card className="@container rounded-2xl border bg-card overflow-hidden shadow-xs py-0 gap-1">
        {/* Unified Hero Header Bar */}
        <div className="p-5 border-b bg-muted/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            {/* Left: Icon, Title, and Single Type Badge */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/60 border">
                {isFile && fileData
                  ? getFileIcon(fileData.mediaType, "size-5")
                  : linkData
                    ? getLinkIcon(linkData.linkType, "size-5")
                    : null}
              </div>

              <div className="min-w-0 flex-1 space-y-1 flex-1">
                <div className="flex flex-col items-start gap-2 flex-1 min-w-0 w-full">
                  <h2
                    className="font-heading text-base @sm:text-lg font-bold text-foreground truncate text-ellipsis w-full leading-snug"
                    title={material.data.title}
                  >
                    {material.data.title}
                  </h2>
                  <Badge variant="secondary" className="py-0 px-2 shrink-0">
                    {isFile && fileData
                      ? getFileCategory(fileData.mediaType)
                      : linkData
                        ? getLinkTypeLabel(linkData.linkType)
                        : null}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 3-Dot Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    size="sm"
                    variant="ghost"
                    className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground shrink-0"
                  />
                }
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">More options</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isFile && fileData && (
                  <>
                    <DropdownMenuItem
                      onClick={() => setPreviewOpen(true)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <Eye className="size-3.5 text-muted-foreground" />
                      <span>Preview</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={isDownloading}
                      onClick={() => handleDownloadFile(fileData.id)}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <Download className="size-3.5 text-muted-foreground" />
                      <span>
                        {isDownloading ? "Downloading..." : "Download"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {!isFile && linkData && (
                  <>
                    <DropdownMenuItem
                      onClick={() => window.open(linkData.url, "_blank")}
                      className="gap-2 text-xs cursor-pointer"
                    >
                      <ExternalLink className="size-3.5 text-muted-foreground" />
                      <span>Open Resource</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem
                  onClick={() =>
                    handleCopy(
                      isFile ? material.data.title : (linkData?.url ?? ""),
                      isFile ? "File name copied" : "Destination URL copied",
                    )
                  }
                  className="gap-2 text-xs cursor-pointer"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5 text-muted-foreground" />
                  )}
                  <span>{isFile ? "Copy Name" : "Copy URL"}</span>
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
                      <span>{isFile ? "Delete File" : "Delete Link"}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Structured Properties List (Linear / Notion style) */}
        <div className="px-5 py-3 border-b bg-muted/10 text-xs">
          <div className="grid grid-cols-1 @[540px]:grid-cols-2 gap-y-2.5 gap-x-6">
            {/* Added by */}
            <div className="flex items-center gap-3">
              <span className="w-20 text-muted-foreground flex items-center gap-1.5 shrink-0">
                <User className="size-3.5 text-muted-foreground" />
                Author
              </span>
              <div className="flex items-center gap-1.5 min-w-0 font-medium text-foreground">
                <UserAvatar
                  size="xxs"
                  username={material.data.owner?.username}
                />
                <span className="truncate">
                  {material.data.owner?.username}
                </span>
              </div>
            </div>

            {/* Date added */}
            <div className="flex items-center gap-3">
              <span className="w-20 text-muted-foreground flex items-center gap-1.5 shrink-0">
                <Calendar className="size-3.5 text-muted-foreground" />
                Added
              </span>
              <span className="font-medium text-foreground">
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

            {/* File specific properties */}
            {isFile && fileData && (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <HardDrive className="size-3.5 text-muted-foreground" />
                    Size
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span>{formatBytes(fileData.size)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      ({fileData.size.toLocaleString()} bytes)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Layers className="size-3.5 text-muted-foreground" />
                    Format
                  </span>
                  <span className="font-medium text-xs text-foreground truncate">
                    {fileData.mediaType}
                  </span>
                </div>
              </>
            )}

            {/* Link specific properties */}
            {!isFile && linkData && (
              <>
                <div className="flex items-center gap-3">
                  <span className="w-20 text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <Layers className="size-3.5 text-muted-foreground" />
                    Type
                  </span>
                  <span className="font-medium text-foreground">
                    {getLinkTypeLabel(linkData.linkType)}
                  </span>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-20 text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                    Target
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <a
                      href={linkData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium text-xs truncate"
                    >
                      {linkData.url}
                    </a>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        handleCopy(linkData.url, "Destination URL copied")
                      }
                      className="size-6 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                      title="Copy destination URL"
                    >
                      {copied ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description Section */}
        {material.data.description ? (
          <div className="px-5 py-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </h3>
            <p className="text-xs @sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {material.data.description}
            </p>
          </div>
        ) : (
          <div className="px-5 py-3 text-xs text-muted-foreground italic">
            No description provided for this resource.
          </div>
        )}
      </Card>

      {/* Modals & Dialogs */}
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
