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
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { getMaterialDownloadUrl } from "../../api/getMaterialDownloadUrl";
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
        className="w-[98vw] max-w-[1600px] h-[96vh] max-h-[96vh] flex flex-col p-0 overflow-hidden rounded-2xl border bg-background shadow-2xl relative"
        contentClassName="p-0 gap-0 h-full w-full overflow-hidden"
      >
        {/* Screen reader accessible title */}
        <DialogTitle className="sr-only">{file.title}</DialogTitle>

        {/* Floating Action Controls */}
        <div className="absolute top-3.5 right-3.5 z-50 flex items-center gap-2">
          {downloadUrl && !isLoading && (
            <>
              <Button
                variant="outline"
                size="icon-sm"
                className="size-9 rounded-full bg-background/80 hover:bg-background backdrop-blur-md shadow-md border border-border/60 text-foreground cursor-pointer transition-transform hover:scale-105"
                onClick={() => window.open(blobUrl || downloadUrl, "_blank")}
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <ExternalLink className="size-4" />
                <span className="sr-only">Open in new tab</span>
              </Button>

              <Button
                variant="outline"
                size="icon-sm"
                className="size-9 rounded-full bg-background/80 hover:bg-background backdrop-blur-md shadow-md border border-border/60 text-foreground cursor-pointer transition-transform hover:scale-105"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = blobUrl || downloadUrl;
                  a.download = file.title;
                  a.target = "_blank";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                title="Download"
                aria-label="Download"
              >
                <Download className="size-4" />
                <span className="sr-only">Download</span>
              </Button>
            </>
          )}

          <DialogClose
            render={
              <Button
                variant="outline"
                size="icon-sm"
                className="size-9 rounded-full bg-background/80 hover:bg-background backdrop-blur-md shadow-md border border-border/60 text-foreground cursor-pointer transition-transform hover:scale-105"
                aria-label="Close"
                title="Close"
              />
            }
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        {/* Full Screen Edge-to-Edge Content */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden bg-background">
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
                <div className="w-full h-full flex items-center justify-center p-2 sm:p-6 overflow-auto bg-black/5 dark:bg-black/30">
                  <img
                    src={blobUrl}
                    alt={file.title}
                    className="max-h-full max-w-full object-contain select-none"
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
