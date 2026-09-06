import { useState } from "react";
import { Plus, UploadCloud, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateFolderModal } from "./CreateFolderModal";
import { UploadFileModal } from "./UploadFileModal";
import { AddLinkModal } from "./AddLinkModal";

interface MaterialsToolbarProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  currentFolderId?: string;
  currentFolderName: string;
  canCreateFolder: boolean;
  canCreateMaterial: boolean;
}

export function MaterialsToolbar({
  communitySlug,
  studyYearSlug,
  courseSlug,
  currentFolderId,
  currentFolderName,
  canCreateFolder,
  canCreateMaterial,
}: MaterialsToolbarProps) {
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [uploadFileOpen, setUploadFileOpen] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);

  return (
    <div className="flex items-center justify-end gap-4 border-b pb-4">
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
    </div>
  );
}
