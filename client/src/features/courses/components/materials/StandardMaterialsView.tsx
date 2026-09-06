import { useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseMaterials } from "../../api/getCourseMaterials";
import {
  useFolderBreadcrumbs,
  breadcrumbKeys,
} from "../../api/getBreadcrumbs";
import { usePermissions } from "@/hooks/usePermissions";
import { useUrlFilters, type FilterSchema } from "@/hooks/useUrlFilters";
import { PERMISSIONS } from "@/lib/permissions";
import { getErrorMessage } from "@/api/types";
import { useUpdateFolder } from "../../api/updateFolder";
import { useUpdateMaterial } from "../../api/updateMaterial";
import type {
  CourseMaterialFolder,
  CourseMaterialFile,
  CourseMaterialLink,
} from "../../api/types";
import type { DraggedItemData } from "./materialsUtils";
import {
  MaterialDetailViewer,
  type SelectedMaterial,
} from "./MaterialDetailViewer";
import { MaterialsToolbar } from "./MaterialsToolbar";
import {
  MaterialsBreadcrumbs,
  type BreadcrumbItem,
} from "./MaterialsBreadcrumbs";
import { FolderCard } from "./FolderCard";
import { FileCard } from "./FileCard";
import { LinkCard } from "./LinkCard";
import {
  MaterialsLoadingSkeleton,
  MaterialsErrorAlert,
  MaterialsEmptyState,
} from "./MaterialsStateViews";

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
  const queryClient = useQueryClient();
  const { filters, setFilters } = useUrlFilters(MATERIALS_FILTER_SCHEMA);

  const { data: serverFolderBreadcrumbs } = useFolderBreadcrumbs(
    filters.folder || undefined,
  );

  const folderBreadcrumbs = useMemo(() => {
    if (!filters.folder) {
      return [{ id: null, name: "Root" }];
    }
    return [
      { id: null, name: "Root" },
      ...(serverFolderBreadcrumbs ?? []).map((b) => ({
        id: b.id,
        name: b.name,
      })),
    ];
  }, [filters.folder, serverFolderBreadcrumbs]);

  const currentFolderId = filters.folder || undefined;
  const lastFolder = folderBreadcrumbs[folderBreadcrumbs.length - 1];
  const currentFolderName = lastFolder?.name ?? "Root";

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
    const currentAncestors = (serverFolderBreadcrumbs ?? []).map((b) => ({
      id: b.id,
      name: b.name,
    }));
    queryClient.setQueryData(breadcrumbKeys.folder(folder.id), [
      ...currentAncestors,
      { id: folder.id, name: folder.name },
    ]);
    setFilters({ folder: folder.id, file: "", link: "" });
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
      setFilters({ folder: target.id ?? "", file: "", link: "" });
    }
  };

  const handleMoveUpOneLevel = async (
    itemType: "folder" | "file" | "link",
    id: string,
    title: string,
  ) => {
    if (!parentOfCurrentFolder) return;

    try {
      if (itemType === "folder") {
        await updateFolderMutation.mutateAsync({
          folderId: id,
          payload: parentOfCurrentFolder.id
            ? { parentFolderId: parentOfCurrentFolder.id }
            : { moveToRoot: true },
        });
      } else {
        await updateMaterialMutation.mutateAsync({
          materialId: id,
          payload: parentOfCurrentFolder.id
            ? { folderId: parentOfCurrentFolder.id }
            : { moveToRoot: true },
        });
      }

      toast.success(
        `Moved "${title}" up to "${parentOfCurrentFolder.name}".`,
      );
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to move item up one level."));
    }
  };

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

  const folders = materials?.folders ?? [];
  const files = materials?.files ?? [];
  const links = materials?.links ?? [];
  const isEmpty =
    folders.length === 0 && files.length === 0 && links.length === 0;

  return (
    <div className="space-y-6">
      {!isMaterialDetail && (
        <MaterialsToolbar
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          courseSlug={courseSlug}
          currentFolderId={currentFolderId}
          currentFolderName={currentFolderName}
          canCreateFolder={canCreateFolder}
          canCreateMaterial={canCreateMaterial}
        />
      )}

      <MaterialsBreadcrumbs
        breadcrumbs={displayBreadcrumbs}
        isArchived={isArchived}
        onNavigate={handleNavigateBreadcrumb}
        onDropIntoFolder={handleMoveIntoFolder}
      />

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
          {isLoading && <MaterialsLoadingSkeleton />}

          {isError && <MaterialsErrorAlert onRetry={() => refetch()} />}

          {!isLoading && !isError && isEmpty && <MaterialsEmptyState />}

          {!isLoading && !isError && !isEmpty && (
            <div className="space-y-6">
              {folders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Folders ({folders.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        canEdit={canEditFolder(folder.owner?.id)}
                        canDelete={canDeleteFolder(folder.owner?.id)}
                        canMoveUp={!isArchived && Boolean(parentOfCurrentFolder)}
                        isArchived={isArchived}
                        isModerator={isFolderModerator}
                        onOpen={handleOpenFolder}
                        onMoveUp={() =>
                          handleMoveUpOneLevel("folder", folder.id, folder.name)
                        }
                        onDropIntoFolder={handleMoveIntoFolder}
                      />
                    ))}
                  </div>
                </div>
              )}

              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        canEdit={canEditMaterial(file.owner?.id)}
                        canDelete={canDeleteMaterial(file.owner?.id)}
                        canMoveUp={!isArchived && Boolean(parentOfCurrentFolder)}
                        onOpen={handleOpenFile}
                        onMoveUp={() =>
                          handleMoveUpOneLevel("file", file.id, file.title)
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {links.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    External Links ({links.length})
                  </h3>
                  <div className="space-y-2">
                    {links.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        canEdit={canEditMaterial(link.owner?.id)}
                        canDelete={canDeleteMaterial(link.owner?.id)}
                        canMoveUp={!isArchived && Boolean(parentOfCurrentFolder)}
                        onOpen={handleOpenLink}
                        onMoveUp={() =>
                          handleMoveUpOneLevel("link", link.id, link.title)
                        }
                      />
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
