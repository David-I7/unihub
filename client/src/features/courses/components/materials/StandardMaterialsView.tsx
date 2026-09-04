import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  Folder,
  ChevronRight,
  FolderOpen,
  Plus,
  UploadCloud,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourseMaterials } from "../../api/getCourseMaterials";
import {
  useFolderBreadcrumbs,
  useMaterialBreadcrumbs,
} from "../../api/getBreadcrumbs";
import { usePermissions } from "@/hooks/usePermissions";
import { useUrlFilters, type FilterSchema } from "@/hooks/useUrlFilters";
import { PERMISSIONS } from "@/lib/permissions";
import { formatBytes, getFileIcon, getLinkIcon } from "./materialsUtils";
import {
  MaterialDetailViewer,
  type SelectedMaterial,
} from "./MaterialDetailViewer";
import { MaterialItemActions } from "./MaterialItemActions";
import { CreateFolderModal } from "./CreateFolderModal";
import { UploadFileModal } from "./UploadFileModal";
import { AddLinkModal } from "./AddLinkModal";
import { EditFolderModal } from "./EditFolderModal";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteFolderDialog } from "./DeleteFolderDialog";
import { DeleteMaterialDialog } from "./DeleteMaterialDialog";
import { useUpdateFolder } from "../../api/updateFolder";
import { useUpdateMaterial } from "../../api/updateMaterial";
import { getErrorMessage } from "@/api/types";
import type {
  CourseMaterialFolder,
  CourseMaterialFile,
  CourseMaterialLink,
} from "../../api/types";
import { UserAvatar } from "@/components/app/UserAvatar";

interface BreadcrumbItem {
  id: string | null;
  name: string;
  type: "folder" | "file" | "link";
  material?: SelectedMaterial;
}

interface DraggedItemData {
  itemType: "folder" | "file" | "link";
  id: string;
  title: string;
}

interface MaterialsUrlFilters {
  folder: string;
  file: string;
  link: string;
}

const MATERIALS_FILTER_SCHEMA: FilterSchema<MaterialsUrlFilters> = {
  folder: { defaultValue: "", paramKey: "folder" },
  file: { defaultValue: "", paramKey: "file" },
  link: { defaultValue: "", paramKey: "link" },
};

interface StandardMaterialsViewProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  isArchived?: boolean;
}

export function StandardMaterialsView({
  communitySlug,
  studyYearSlug,
  courseSlug,
  isArchived = false,
}: StandardMaterialsViewProps) {
  const { filters, setFilters } = useUrlFilters(MATERIALS_FILTER_SCHEMA);

  const [folderBreadcrumbs, setFolderBreadcrumbs] = useState<
    Array<{ id: string | null; name: string }>
  >([{ id: null, name: "Root" }]);

  const needsFolderBreadcrumbs = Boolean(
    filters.folder && folderBreadcrumbs.length <= 1,
  );
  const { data: serverFolderBreadcrumbs } = useFolderBreadcrumbs(
    needsFolderBreadcrumbs ? filters.folder : undefined,
  );

  const activeMaterialId = filters.file || filters.link || undefined;
  const needsMaterialBreadcrumbs = Boolean(
    activeMaterialId && folderBreadcrumbs.length <= 1,
  );
  const { data: serverMaterialBreadcrumbs } = useMaterialBreadcrumbs(
    needsMaterialBreadcrumbs ? activeMaterialId : undefined,
  );

  useEffect(() => {
    if (serverFolderBreadcrumbs && serverFolderBreadcrumbs.length > 0) {
      queueMicrotask(() => {
        setFolderBreadcrumbs([
          { id: null, name: "Root" },
          ...serverFolderBreadcrumbs.map((b) => ({ id: b.id, name: b.name })),
        ]);
      });
    }
  }, [serverFolderBreadcrumbs]);

  useEffect(() => {
    if (serverMaterialBreadcrumbs && serverMaterialBreadcrumbs.length > 0) {
      const ancestorFolders = serverMaterialBreadcrumbs.slice(0, -1);
      queueMicrotask(() => {
        setFolderBreadcrumbs([
          { id: null, name: "Root" },
          ...ancestorFolders.map((b) => ({ id: b.id, name: b.name })),
        ]);
      });
    }
  }, [serverMaterialBreadcrumbs]);

  // Modal visibility states
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);

  // Selected item for action modals
  const [activeFolderToEdit, setActiveFolderToEdit] =
    useState<CourseMaterialFolder | null>(null);
  const [activeFolderToDelete, setActiveFolderToDelete] =
    useState<CourseMaterialFolder | null>(null);

  const [activeMaterialToEdit, setActiveMaterialToEdit] = useState<
    | { type: "file"; data: CourseMaterialFile }
    | { type: "link"; data: CourseMaterialLink }
    | null
  >(null);
  const [activeMaterialToDelete, setActiveMaterialToDelete] = useState<
    | { type: "file"; data: CourseMaterialFile }
    | { type: "link"; data: CourseMaterialLink }
    | null
  >(null);

  // Drag over target state for styling
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [dragOverBreadcrumbId, setDragOverBreadcrumbId] = useState<
    string | null
  >(null);

  const currentFolderId = filters.folder || undefined;
  const lastFolder = folderBreadcrumbs[folderBreadcrumbs.length - 1];
  const currentFolderName = lastFolder?.name ?? "Root";

  // Parent folder of current folder (for "Move up one level")
  const parentOfCurrentFolder =
    folderBreadcrumbs.length > 1
      ? folderBreadcrumbs[folderBreadcrumbs.length - 2]
      : null;

  const {
    canCreateFolder: rawCanCreateFolder,
    canCreateMaterial: rawCanCreateMaterial,
    canEditFolder: rawCanEditFolder,
    canDeleteFolder: rawCanDeleteFolder,
    canEditMaterial: rawCanEditMaterial,
    canDeleteMaterial: rawCanDeleteMaterial,
    hasPermission,
  } = usePermissions(communitySlug);

  const canCreateFolder = !isArchived && rawCanCreateFolder;
  const canCreateMaterial = !isArchived && rawCanCreateMaterial;
  const canEditFolder = (ownerId?: string | number | null) =>
    !isArchived && rawCanEditFolder(ownerId);
  const canDeleteFolder = (ownerId?: string | number | null) =>
    !isArchived && rawCanDeleteFolder(ownerId);
  const canEditMaterial = (ownerId?: string | number | null) =>
    !isArchived && rawCanEditMaterial(ownerId);
  const canDeleteMaterial = (ownerId?: string | number | null) =>
    !isArchived && rawCanDeleteMaterial(ownerId);
  const isFolderModerator =
    !isArchived && hasPermission(PERMISSIONS.MODERATE_FOLDER);

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

  const selectedFile = useMemo(
    () =>
      filters.file
        ? materials?.files?.find((f) => f.id === filters.file)
        : null,
    [filters.file, materials?.files],
  );
  const selectedLink = useMemo(
    () =>
      filters.link
        ? materials?.links?.find((l) => l.id === filters.link)
        : null,
    [filters.link, materials?.links],
  );

  const activeMaterial: SelectedMaterial = useMemo(() => {
    if (selectedFile) return { type: "file", data: selectedFile };
    if (selectedLink) return { type: "link", data: selectedLink };
    return null;
  }, [selectedFile, selectedLink]);

  const isMaterialDetail = Boolean(activeMaterial);

  const displayBreadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const list: BreadcrumbItem[] = folderBreadcrumbs.map((b) => ({
      id: b.id,
      name: b.name,
      type: "folder" as const,
    }));
    if (selectedFile) {
      list.push({
        id: selectedFile.id,
        name: selectedFile.title,
        type: "file",
        material: { type: "file", data: selectedFile },
      });
    } else if (selectedLink) {
      list.push({
        id: selectedLink.id,
        name: selectedLink.title,
        type: "link",
        material: { type: "link", data: selectedLink },
      });
    }
    return list;
  }, [folderBreadcrumbs, selectedFile, selectedLink]);

  const updateFolderMutation = useUpdateFolder();
  const updateMaterialMutation = useUpdateMaterial();

  const handleOpenFolder = (folder: CourseMaterialFolder) => {
    setFilters({ folder: folder.id, file: "", link: "" });
    setFolderBreadcrumbs((prev) => [
      ...prev,
      { id: folder.id, name: folder.name },
    ]);
  };

  const handleOpenFile = (file: CourseMaterialFile) => {
    setFilters({ file: file.id, link: "" });
  };

  const handleOpenLink = (link: CourseMaterialLink) => {
    setFilters({ link: link.id, file: "" });
  };

  const handleNavigateBreadcrumb = (index: number) => {
    if (index < folderBreadcrumbs.length) {
      const target = folderBreadcrumbs[index];
      setFolderBreadcrumbs((prev) => prev.slice(0, index + 1));
      setFilters({ folder: target.id ?? "", file: "", link: "" });
    }
  };

  // Move an item up one level in the hierarchy
  const handleMoveUpOneLevel = async (item: DraggedItemData) => {
    if (!parentOfCurrentFolder) return;

    try {
      if (item.itemType === "folder") {
        await updateFolderMutation.mutateAsync({
          folderId: item.id,
          payload: parentOfCurrentFolder.id
            ? { parentFolderId: parentOfCurrentFolder.id }
            : { moveToRoot: true },
        });
      } else {
        await updateMaterialMutation.mutateAsync({
          materialId: item.id,
          payload: parentOfCurrentFolder.id
            ? { folderId: parentOfCurrentFolder.id }
            : { moveToRoot: true },
        });
      }

      toast.success(
        `Moved "${item.title}" up to "${parentOfCurrentFolder.name}".`,
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to move item up one level."));
    }
  };

  // Move an item into a target folder
  const handleMoveIntoFolder = async (
    dragged: DraggedItemData,
    targetFolderId: string | null,
    targetFolderName: string,
  ) => {
    if (dragged.id === targetFolderId) return;

    try {
      if (dragged.itemType === "folder") {
        await updateFolderMutation.mutateAsync({
          folderId: dragged.id,
          payload: targetFolderId
            ? { parentFolderId: targetFolderId }
            : { moveToRoot: true },
        });
      } else {
        await updateMaterialMutation.mutateAsync({
          materialId: dragged.id,
          payload: targetFolderId
            ? { folderId: targetFolderId }
            : { moveToRoot: true },
        });
      }

      toast.success(`Moved "${dragged.title}" into "${targetFolderName}".`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to move item."));
    }
  };

  const handleDragStart = (e: React.DragEvent, item: DraggedItemData) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const folders = materials?.folders ?? [];
  const files = materials?.files ?? [];
  const links = materials?.links ?? [];
  const isEmpty =
    folders.length === 0 && files.length === 0 && links.length === 0;

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Title on left, Action Buttons on right */}
      <div className="flex items-center justify-end gap-4 border-b pb-4">
        {/* Action Buttons (Only shown when browsing a folder) */}
        {!isMaterialDetail && (
          <div className="flex flex-wrap items-center gap-2">
            {canCreateFolder && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreateFolderOpen(true)}
                className="gap-1.5 cursor-pointer"
              >
                <Plus className="size-4" />
                <span>New Folder</span>
              </Button>
            )}

            {canCreateMaterial && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setUploadFileOpen(true)}
                  className="gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="size-4" />
                  <span>Upload File</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAddLinkOpen(true)}
                  className="gap-1.5 cursor-pointer"
                >
                  <Link2 className="size-4" />
                  <span>Add Link</span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Breadcrumb Navigation Bar with Drop Targets */}
      <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border bg-card px-4 py-2.5 text-xs text-muted-foreground">
        <FolderOpen className="size-4 text-primary shrink-0 mr-1" />
        {displayBreadcrumbs.map((item, index) => {
          const isLast = index === displayBreadcrumbs.length - 1;
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
                onClick={() => handleNavigateBreadcrumb(index)}
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
                    const raw = e.dataTransfer.getData("application/json");
                    if (raw) {
                      try {
                        const parsed: DraggedItemData = JSON.parse(raw);
                        handleMoveIntoFolder(parsed, item.id, item.name);
                      } catch {
                        // Ignore malformed drag payload
                      }
                    }
                  }
                }}
                className={`font-semibold transition-all cursor-pointer px-1.5 py-0.5 rounded-md ${
                  isBreadcrumbDropTarget
                    ? "bg-primary/20 text-primary ring-2 ring-primary"
                    : isLast
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

      {/* When a material (file or link) is selected, show detail viewer */}
      {isMaterialDetail && activeMaterial ? (
        <MaterialDetailViewer
          material={activeMaterial}
          communitySlug={communitySlug}
          isArchived={isArchived}
          onDeleted={() => {
            setFilters({ file: "", link: "" });
          }}
          onUpdated={() => {
            refetch();
          }}
        />
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

          {/* Empty State with Action Buttons */}
          {!isLoading && !isError && isEmpty && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <FolderOpen className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Folder is Empty
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  No files, links, or subfolders have been added to this
                  location yet.
                </p>
              </div>
            </div>
          )}

          {/* Materials List */}
          {!isLoading && !isError && !isEmpty && (
            <div className="space-y-6">
              {/* Folders Section with Drag and Drop Support */}
              {folders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Folders ({folders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {folders.map((folder) => {
                      const canUserEdit = canEditFolder(folder.owner?.id);
                      const canUserDelete = canDeleteFolder(folder.owner?.id);
                      const isDropTarget = dragOverFolderId === folder.id;

                      return (
                        <div
                          key={folder.id}
                          draggable={canUserEdit}
                          onDragStart={(e) =>
                            handleDragStart(e, {
                              itemType: "folder",
                              id: folder.id,
                              title: folder.name,
                            })
                          }
                          onDragOver={(e) => {
                            if (!isArchived) {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              setDragOverFolderId(folder.id);
                            }
                          }}
                          onDragLeave={() => setDragOverFolderId(null)}
                          onDrop={(e) => {
                            if (!isArchived) {
                              e.preventDefault();
                              setDragOverFolderId(null);
                              const raw =
                                e.dataTransfer.getData("application/json");
                              if (raw) {
                                try {
                                  const parsed: DraggedItemData =
                                    JSON.parse(raw);
                                  handleMoveIntoFolder(
                                    parsed,
                                    folder.id,
                                    folder.name,
                                  );
                                } catch {
                                  // Ignore error
                                }
                              }
                            }
                          }}
                          onClick={() => handleOpenFolder(folder)}
                          className={`group flex items-center justify-between rounded-xl border bg-card p-3.5 hover:border-primary/50 hover:bg-muted/20 transition-all cursor-pointer shadow-2xs ${
                            isDropTarget
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
                                <UserAvatar
                                  size="xxs"
                                  username={folder.owner?.username}
                                />
                                <span className="truncate">
                                  {folder.owner?.username}
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

                          <div className="flex items-center gap-1 shrink-0">
                            <MaterialItemActions
                              canEdit={canUserEdit}
                              canDelete={canUserDelete}
                              canMoveUp={
                                !isArchived && Boolean(parentOfCurrentFolder)
                              }
                              onEdit={() => setActiveFolderToEdit(folder)}
                              onMoveUp={() =>
                                handleMoveUpOneLevel({
                                  itemType: "folder",
                                  id: folder.id,
                                  title: folder.name,
                                })
                              }
                              onDelete={() => setActiveFolderToDelete(folder)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Files Section */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file: CourseMaterialFile) => {
                      const canUserEdit = canEditMaterial(file.owner?.id);
                      const canUserDelete = canDeleteMaterial(file.owner?.id);

                      return (
                        <div
                          key={file.id}
                          draggable={canUserEdit}
                          onDragStart={(e) =>
                            handleDragStart(e, {
                              itemType: "file",
                              id: file.id,
                              title: file.title,
                            })
                          }
                          onClick={() => handleOpenFile(file)}
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
                                <span>{formatBytes(file.size)}</span>
                                <span>•</span>
                                <UserAvatar
                                  size="xxs"
                                  username={file.owner?.username}
                                />
                                <span>{file.owner.username}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    file.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <MaterialItemActions
                              canEdit={canUserEdit}
                              canDelete={canUserDelete}
                              canMoveUp={
                                !isArchived && Boolean(parentOfCurrentFolder)
                              }
                              onEdit={() =>
                                setActiveMaterialToEdit({
                                  type: "file",
                                  data: file,
                                })
                              }
                              onMoveUp={() =>
                                handleMoveUpOneLevel({
                                  itemType: "file",
                                  id: file.id,
                                  title: file.title,
                                })
                              }
                              onDelete={() =>
                                setActiveMaterialToDelete({
                                  type: "file",
                                  data: file,
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Links Section */}
              {links.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    External Links ({links.length})
                  </h3>
                  <div className="space-y-2">
                    {links.map((link: CourseMaterialLink) => {
                      const canUserEdit = canEditMaterial(link.owner?.id);
                      const canUserDelete = canDeleteMaterial(link.owner?.id);

                      return (
                        <div
                          key={link.id}
                          draggable={canUserEdit}
                          onDragStart={(e) =>
                            handleDragStart(e, {
                              itemType: "link",
                              id: link.id,
                              title: link.title,
                            })
                          }
                          onClick={() => handleOpenLink(link)}
                          className="group flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-2xs hover:border-primary/50 hover:bg-muted/10 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                              {getLinkIcon(link.linkType)}
                            </div>
                            <div className="space-y-0.5 min-w-0 flex-1">
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
                                <UserAvatar
                                  size="xxs"
                                  username={link.owner?.username}
                                />
                                <span>{link.owner.username}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    link.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <MaterialItemActions
                              canEdit={canUserEdit}
                              canDelete={canUserDelete}
                              canMoveUp={
                                !isArchived && Boolean(parentOfCurrentFolder)
                              }
                              onEdit={() =>
                                setActiveMaterialToEdit({
                                  type: "link",
                                  data: link,
                                })
                              }
                              onMoveUp={() =>
                                handleMoveUpOneLevel({
                                  itemType: "link",
                                  id: link.id,
                                  title: link.title,
                                })
                              }
                              onDelete={() =>
                                setActiveMaterialToDelete({
                                  type: "link",
                                  data: link,
                                })
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modals & Dialogs */}
      <CreateFolderModal
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
        courseSlug={courseSlug}
        parentFolderId={currentFolderId}
        parentFolderName={currentFolderName}
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
      />

      <UploadFileModal
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
        courseSlug={courseSlug}
        parentFolderId={currentFolderId}
        parentFolderName={currentFolderName}
        open={uploadFileOpen}
        onOpenChange={setUploadFileOpen}
      />

      <AddLinkModal
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
        courseSlug={courseSlug}
        parentFolderId={currentFolderId}
        parentFolderName={currentFolderName}
        open={addLinkOpen}
        onOpenChange={setAddLinkOpen}
      />

      <EditFolderModal
        folder={activeFolderToEdit}
        open={Boolean(activeFolderToEdit)}
        onOpenChange={(open) => {
          if (!open) setActiveFolderToEdit(null);
        }}
      />

      <DeleteFolderDialog
        folder={activeFolderToDelete}
        isModerator={isFolderModerator}
        open={Boolean(activeFolderToDelete)}
        onOpenChange={(open) => {
          if (!open) setActiveFolderToDelete(null);
        }}
      />

      <EditMaterialModal
        material={activeMaterialToEdit}
        open={Boolean(activeMaterialToEdit)}
        onOpenChange={(open) => {
          if (!open) setActiveMaterialToEdit(null);
        }}
      />

      <DeleteMaterialDialog
        material={activeMaterialToDelete}
        open={Boolean(activeMaterialToDelete)}
        onOpenChange={(open) => {
          if (!open) setActiveMaterialToDelete(null);
        }}
      />
    </div>
  );
}
