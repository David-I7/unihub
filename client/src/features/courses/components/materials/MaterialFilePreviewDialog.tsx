import { useState, useEffect } from "react";
import {
  ExternalLink,
  Download,
  AlertTriangle as AlertCircle,
  Eye,
} from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isBlobLoading, setIsBlobLoading] = useState(false);
  const [blobError, setBlobError] = useState<string | null>(null);

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

  // Fetch the file as a Blob to create a same-origin object URL for iframes/images
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (!open || !downloadUrl || (!isPdf && !isImage)) {
      setBlobUrl(null);
      setIsBlobLoading(false);
      setBlobError(null);
      return;
    }

    setIsBlobLoading(true);
    setBlobError(null);

    fetch(downloadUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load file preview (${res.status})`);
        }
        return res.blob();
      })
      .then((blob) => {
        if (!active) return;
        const typedBlob = file?.mediaType
          ? new Blob([blob], { type: file.mediaType })
          : blob;
        createdUrl = URL.createObjectURL(typedBlob);
        setBlobUrl(createdUrl);
        setIsBlobLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setBlobError(
          err instanceof Error ? err.message : "Failed to load file content.",
        );
        setIsBlobLoading(false);
      });

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [open, downloadUrl, isPdf, isImage, file?.mediaType]);

  if (!file) return null;

  const isLoading = isUrlLoading || isBlobLoading;
  const hasError = isUrlError || Boolean(blobError);
  const errorMessage = isUrlError
    ? getErrorMessage(queryError, "Failed to load file preview.")
    : blobError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Title & Action Controls */}
        <DialogHeader className="space-y-1.5 pb-3 border-b pr-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                {getFileIcon(file.mediaType)}
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-bold truncate">
                  {file.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-mono py-0 px-1.5"
                  >
                    {getFileCategory(file.mediaType)}
                  </Badge>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                </DialogDescription>
              </div>
            </div>

            {/* Quick Actions */}
            {downloadUrl && !isLoading && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="xs"
                  variant="outline"
                  className="gap-1.5 text-xs cursor-pointer"
                  onClick={() => window.open(blobUrl || downloadUrl, "_blank")}
                  title="Open original file in new tab"
                >
                  <ExternalLink className="size-3.5" />
                  <span className="hidden sm:inline">Open in Tab</span>
                </Button>

                <Button
                  size="xs"
                  className="gap-1.5 text-xs font-bold cursor-pointer"
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
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Preview Content Area */}
        <div className="flex-1 min-h-[360px] max-h-[75vh] flex items-center justify-center overflow-auto rounded-xl bg-muted/20 ">
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
                <div className="flex items-center justify-center w-full h-full">
                  <img
                    src={blobUrl}
                    alt={file.title}
                    className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>
              )}

              {isPdf && blobUrl && (
                <iframe
                  src={`${blobUrl}#toolbar=1`}
                  className="w-full h-[70vh] rounded-xl border border-border bg-card shadow-xs"
                  title={file.title}
                />
              )}

              {!isImage && !isPdf && downloadUrl && (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Eye className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                      Inline preview is not supported for this file format.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
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
