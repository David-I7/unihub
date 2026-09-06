import { useEffect } from "react";
import {
  ExternalLink,
  Download,
  AlertTriangle as AlertCircle,
  Eye,
  X,
} from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { getMaterialDownloadUrl } from "../../api/getMaterialDownloadUrl";
import { getFileCategory, formatBytes, getFileIcon } from "./materialsUtils";
import { getErrorMessage } from "@/api/types";
import type { CourseMaterialFile } from "../../api/types";

interface MaterialFilePreviewDialogProps {
  file: CourseMaterialFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaterialFilePreviewDialog({
  file,
  open,
  onOpenChange,
}: MaterialFilePreviewDialogProps) {
  const {
    data,
    isLoading: isUrlLoading,
    isError: isUrlError,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["materials", file?.id, "download-url"],
    queryFn: () => getMaterialDownloadUrl(file!.id),
    enabled: Boolean(open && file?.id),
    staleTime: 5 * 60 * 1000,
  });

  const downloadUrl = data?.downloadUrl ?? null;
  const isImage = Boolean(file?.mediaType?.startsWith("image/"));
  const isPdf = file?.mediaType === "application/pdf";

  const {
    data: blobUrl,
    isLoading: isBlobLoading,
    isError: isBlobError,
    error: blobError,
  } = useQuery({
    queryKey: ["materials", file?.id, "preview-blob", downloadUrl],
    queryFn: async () => {
      if (!downloadUrl) return null;
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Failed to load file preview (${res.status})`);
      }
      const blob = await res.blob();
      const typedBlob = file?.mediaType
        ? new Blob([blob], { type: file.mediaType })
        : blob;
      return URL.createObjectURL(typedBlob);
    },
    enabled: Boolean(open && downloadUrl && (isPdf || isImage)),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  if (!file) return null;

  const isLoading = isUrlLoading || isBlobLoading;
  const hasError = isUrlError || isBlobError;
  const errorMessage = isUrlError
    ? getErrorMessage(queryError, "Failed to load file preview.")
    : blobError instanceof Error
      ? blobError.message
      : "Failed to load file content.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[96vw] max-w-7xl h-[92vh] max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-2xl border bg-card shadow-2xl"
        contentClassName="p-0 gap-0 h-full flex flex-col overflow-hidden"
      >
        {/* Header with Title & Action Controls */}
        <DialogHeader className="h-14 px-4 sm:px-6 flex flex-row items-center justify-between border-b bg-muted/30 shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              {getFileIcon(file.mediaType)}
            </div>
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <DialogTitle className="text-sm sm:text-base font-bold truncate">
                {file.title}
              </DialogTitle>
              <Badge
                variant="secondary"
                className="text-[10px] font-mono py-0 px-1.5 shrink-0 hidden xs:inline-flex"
              >
                {getFileCategory(file.mediaType)}
              </Badge>
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                • {formatBytes(file.size)}
              </span>
            </div>
          </div>

          {/* Quick Actions & Inline Close Button */}
          <div className="flex items-center gap-2 shrink-0">
            {downloadUrl && !isLoading && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs cursor-pointer"
                  onClick={() => window.open(blobUrl || downloadUrl, "_blank")}
                  title="Open original file in new tab"
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </Button>

                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-bold cursor-pointer"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = blobUrl || downloadUrl;
                    a.download = file.title;
                    a.target = "_blank";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  title="Download File"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </>
            )}

            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Close"
                  title="Close"
                />
              }
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>

        {/* Full Modal Responsive Preview Content Area */}
        <div className="flex-1 w-full h-full min-h-0 flex items-center justify-center overflow-hidden bg-muted/10">
          {isLoading && (
            <div className="flex flex-col items-center justify-center space-y-3 py-16 text-muted-foreground">
              <Spinner className="size-8 animate-spin text-primary" />
              <p className="text-xs font-semibold">Loading file preview...</p>
            </div>
          )}

          {hasError && !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 max-w-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertCircle className="size-5" />
              </div>
              <p className="text-xs font-semibold text-destructive">
                {errorMessage}
              </p>
              <Button size="xs" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !hasError && (
            <>
              {isImage && blobUrl && (
                <div className="flex items-center justify-center w-full h-full p-2 sm:p-4 overflow-auto">
                  <img
                    src={blobUrl}
                    alt={file.title}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {isPdf && blobUrl && (
                <iframe
                  src={`${blobUrl}#toolbar=1`}
                  className="w-full h-full border-0 bg-card"
                  title={file.title}
                />
              )}

              {!isImage && !isPdf && downloadUrl && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Eye className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Inline preview is not supported for this file format.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please download the file to view its contents on your
                      device.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-2 font-bold cursor-pointer mt-2"
                    onClick={() => window.open(downloadUrl, "_blank")}
                  >
                    <Download className="size-4" />
                    <span>Download File</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
