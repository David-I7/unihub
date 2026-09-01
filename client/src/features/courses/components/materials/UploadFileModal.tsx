import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  Folder,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import {
  ALLOWED_MEDIA_TYPES,
  MAX_PDF_SIZE_BYTES,
} from "../../schemas/materialSchemas";
import { uploadMaterialFileFlow } from "../../api/uploadMaterialFile";
import { formatBytes } from "./materialsUtils";
import { useQueryClient } from "@tanstack/react-query";
import { courseMaterialsKeys } from "../../api/getCourseMaterials";

interface UploadFileModalProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  parentFolderId?: string | null;
  parentFolderName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadFileModal({
  communitySlug,
  studyYearSlug,
  courseSlug,
  parentFolderId,
  parentFolderName = "Root",
  open,
  onOpenChange,
}: UploadFileModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);

  const resetForm = () => {
    setSelectedFile(null);
    setTitle("");
    setDescription("");
    setFileError(null);
    setTitleError(null);
    setServerError(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isUploading) return;
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const validateSelectedFile = (file: File): boolean => {
    const mediaType = file.type;
    const maxSize = ALLOWED_MEDIA_TYPES[mediaType];

    if (!maxSize) {
      setFileError(
        "Unsupported file type. Only PDF and images (PNG, JPEG, WebP) are allowed.",
      );
      return false;
    }

    if (file.size > maxSize) {
      const limitDesc = maxSize === MAX_PDF_SIZE_BYTES ? "20MB" : "5MB";
      setFileError(
        `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${limitDesc}.`,
      );
      return false;
    }

    setFileError(null);
    return true;
  };

  const handleFileChange = (file: File) => {
    if (validateSelectedFile(file)) {
      setSelectedFile(file);
      // Auto-populate title if empty or unchanged
      const rawName =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(rawName);
      setTitleError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    toast.info("File upload was cancelled.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setFileError("Please select a file to upload.");
      return;
    }

    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }

    if (title.trim().length > 200) {
      setTitleError("Title must not exceed 200 characters.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setServerError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      await uploadMaterialFileFlow({
        communitySlug,
        studyYearSlug,
        courseSlug,
        file: selectedFile,
        title: title.trim(),
        description: description.trim() || undefined,
        folderId: parentFolderId || null,
        signal: controller.signal,
        onProgress: (pct) => setUploadProgress(pct),
      });

      queryClient.invalidateQueries({
        queryKey: courseMaterialsKeys.all,
      });

      toast.success(`File "${title.trim()}" uploaded successfully!`);
      resetForm();
      onOpenChange(false);
    } catch (err: unknown) {
      if (
        (err as Error)?.name === "CanceledError" ||
        (err as Error)?.name === "AbortError"
      ) {
        return;
      }
      const message = getErrorMessage(err, "Failed to upload file.");
      setServerError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Material File</DialogTitle>
          <DialogDescription>
            Upload lecture notes, PDFs, assignments, or study diagrams.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {serverError && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              <AlertCircle className="size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Target Location */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/50 border text-xs text-muted-foreground">
            <Folder className="size-4 text-primary shrink-0" />
            <span>Target location:</span>
            <span className="font-semibold text-foreground truncate">
              {parentFolderName}
            </span>
          </div>

          {/* Dropzone Area */}
          {!selectedFile ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                <UploadCloud className="size-6" />
              </div>
              <p className="text-xs font-bold text-foreground">
                Click to browse or drag and drop a file
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                PDF (up to 20MB) or PNG, JPEG, WebP (up to 5MB)
              </p>
            </div>
          ) : (
            /* Selected File Card */
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{formatBytes(selectedFile.size)}</span>
                    <span>•</span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1.5 py-0 font-mono"
                    >
                      {selectedFile.type || "binary"}
                    </Badge>
                  </div>
                </div>
              </div>

              {!isUploading && (
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  onClick={() => setSelectedFile(null)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          )}

          {fileError && <FieldError errors={[{ message: fileError }]} />}

          {/* Title Field */}
          <Field>
            <FieldLabel htmlFor="materialTitle">Title</FieldLabel>
            <Input
              id="materialTitle"
              placeholder="e.g. Chapter 3 Lecture Slides"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              disabled={isUploading}
              maxLength={200}
            />
            {titleError && <FieldError errors={[{ message: titleError }]} />}
          </Field>

          {/* Description Field */}
          <Field>
            <FieldLabel htmlFor="materialDescription">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (Optional)
              </span>
            </FieldLabel>
            <Textarea
              id="materialDescription"
              rows={3}
              placeholder="Add key notes, covered topics, or summary..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              maxLength={2000}
              className="text-xs"
            />
            <FieldDescription>
              {description.length} / 2000 characters
            </FieldDescription>
          </Field>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 rounded-xl border bg-muted/40 p-3.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span className="flex items-center gap-1.5">
                  <UploadCloud className="size-4 text-primary animate-bounce" />
                  Uploading file to storage...
                </span>
                <span className="font-mono text-primary">
                  {uploadProgress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            {isUploading ? (
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelUpload}
                className="cursor-pointer"
              >
                Cancel Upload
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="gap-1.5 font-bold cursor-pointer"
                >
                  Upload File
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
