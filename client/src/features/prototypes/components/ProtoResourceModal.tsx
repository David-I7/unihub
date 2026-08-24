import { useState } from "react";
import {
  X,
  FileText,
  Video,
  ExternalLink,
  Download,
  Calendar,
  Clock,
  Award,
  Paperclip,
  CheckCircle2,
  Bookmark,
  AlertTriangle,
  User,
  Sparkles,
  Link as LinkIcon,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MockResource, MockAttachment } from "../data/mockAcademicData";

function GithubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface ProtoResourceModalProps {
  resource: MockResource | null;
  onClose: () => void;
  onOpenAttachment?: (attachment: MockAttachment) => void;
}

export function ProtoResourceModal({
  resource,
  onClose,
  onOpenAttachment,
}: ProtoResourceModalProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!resource) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("ro-RO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        {/* Header with Type Badge & Quick Actions */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            {resource.type === "MATERIAL_FILE" && (
              <span className="flex items-center gap-1.5 rounded-md bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <FileText className="size-3.5" /> PDF / Document
              </span>
            )}
            {resource.type === "MATERIAL_LINK" && (
              <span className="flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {resource.linkData?.linkType === "GITHUB" ? (
                  <GithubIcon className="size-3.5" />
                ) : resource.linkData?.linkType === "VIDEO" ? (
                  <Video className="size-3.5" />
                ) : (
                  <LinkIcon className="size-3.5" />
                )}
                {resource.linkData?.linkType || "External Link"}
              </span>
            )}
            {resource.type === "ASSIGNMENT" && (
              <span className="flex items-center gap-1.5 rounded-md bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Award className="size-3.5" /> Assignment ({resource.assignmentData?.gradeWeight}% Grade)
              </span>
            )}
            {resource.type === "EXAM" && (
              <span className="flex items-center gap-1.5 rounded-md bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-3.5" /> Scheduled Exam ({resource.examData?.gradeWeight}% Grade)
              </span>
            )}
            {resource.type === "LECTURE" && (
              <span className="flex items-center gap-1.5 rounded-md bg-purple-500/15 px-2.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Calendar className="size-3.5" /> Live Lecture ({resource.lectureData?.location})
              </span>
            )}

            {/* Tag Badges */}
            {resource.tags?.map((tag) => (
              <span
                key={tag}
                className="hidden sm:inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant={isSaved ? "default" : "ghost"}
              onClick={() => setIsSaved(!isSaved)}
              title={isSaved ? "Saved to My Resources" : "Save Resource"}
            >
              <Bookmark className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant={isCompleted ? "default" : "ghost"}
              onClick={() => setIsCompleted(!isCompleted)}
              title={isCompleted ? "Completed" : "Mark as Completed"}
            >
              <CheckCircle2 className={`size-4 ${isCompleted ? "text-emerald-400" : ""}`} />
            </Button>
            <Button size="icon-sm" variant="ghost" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {resource.title}
            </h2>
            {resource.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {resource.description}
              </p>
            )}
          </div>

          {/* Subtype-Specific Interactive Previews */}

          {/* 1. MATERIAL_FILE Preview */}
          {resource.type === "MATERIAL_FILE" && resource.fileData && (
            <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FileText className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {resource.fileData.storageKey.split("/").pop()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {resource.fileData.mediaType} • {formatFileSize(resource.fileData.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => alert("Preview PDF modal triggered!")}>
                    <BookOpen className="size-3.5" /> Read Online
                  </Button>
                  <Button size="sm" className="gap-1.5" onClick={() => alert("File download started!")}>
                    <Download className="size-3.5" /> Download File
                  </Button>
                </div>
              </div>

              {/* Simulated Document Viewer Teaser */}
              <div className="rounded-lg border bg-background p-4 text-center shadow-inner">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-2">
                  <Sparkles className="size-3.5 text-primary" /> Integrated PDF Preview Ready
                </div>
                <div className="h-28 rounded-md bg-muted/50 border border-dashed flex flex-col items-center justify-center p-3 text-xs text-muted-foreground">
                  <FileText className="size-8 text-primary/60 mb-1" />
                  <span>Document preview rendered safely with fast text search and annotation tools</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. MATERIAL_LINK Preview */}
          {resource.type === "MATERIAL_LINK" && resource.linkData && (
            <div className="rounded-xl border bg-muted/20 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {resource.linkData.linkType === "GITHUB" && <GithubIcon className="size-4" />}
                    {resource.linkData.linkType === "VIDEO" && <Video className="size-4 text-rose-500" />}
                    <span>{resource.linkData.linkType} Resource Link</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    {resource.linkData.url}
                  </p>
                </div>

                <a
                  href={resource.linkData.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                >
                  <ExternalLink className="size-3.5" /> Open Link
                </a>
              </div>

              {/* Video Playlist preview helper */}
              {resource.linkData.linkType === "VIDEO" && (
                <div className="rounded-lg border bg-background p-3 flex items-center gap-3">
                  <div className="size-10 rounded-md bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                    <Video className="size-5" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">YouTube Lecture Playlist</p>
                    <p className="text-muted-foreground">High quality seminar recordings from course professors</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. ASSIGNMENT Preview */}
          {resource.type === "ASSIGNMENT" && resource.assignmentData && (
            <div className="rounded-xl border bg-amber-500/5 border-amber-500/20 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="size-3.5 text-amber-500" /> Due Date
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {formatDate(resource.assignmentData.dueDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Award className="size-3.5 text-amber-500" /> Grade Weight
                  </div>
                  <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                    {resource.assignmentData.gradeWeight}% of Final Mark
                  </p>
                </div>

                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="size-3.5 text-amber-500" /> Estimated Time
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {resource.assignmentData.estimatedDurationMinutes
                      ? `${Math.round(resource.assignmentData.estimatedDurationMinutes / 60)} hours`
                      : "Self-paced"}
                  </p>
                </div>
              </div>

              {/* Attachments for Assignment */}
              {resource.assignmentData.attachments && resource.assignmentData.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="size-3.5" /> Attached Assignment Specifications & Starter Files
                  </h4>
                  <div className="space-y-1.5">
                    {resource.assignmentData.attachments.map((att) => (
                      <div
                        key={att.id}
                        onClick={() => onOpenAttachment?.(att)}
                        className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-xs hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="size-3.5 text-primary" />
                          <span className="font-medium text-foreground">{att.title}</span>
                        </div>
                        <span className="text-[11px] text-primary flex items-center gap-1">
                          View Attachment <ExternalLink className="size-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. EXAM Preview */}
          {resource.type === "EXAM" && resource.examData && (
            <div className="rounded-xl border bg-rose-500/5 border-rose-500/20 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="size-3.5 text-rose-500" /> Date & Time
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {formatDate(resource.examData.scheduledDate)}
                  </p>
                </div>

                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Award className="size-3.5 text-rose-500" /> Grade Weight
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {resource.examData.gradeWeight}% of Final Mark
                  </p>
                </div>

                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Clock className="size-3.5 text-rose-500" /> Location / Hall
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">
                    {resource.examData.roomOrPlatform || "Amfiteatru FMI"}
                  </p>
                </div>
              </div>

              {/* Linked Past Exams & Sample Papers (Attachments) */}
              {resource.examData.attachments && resource.examData.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="size-3.5" /> Sample Past Exam Papers & Solution Guides
                  </h4>
                  <div className="space-y-1.5">
                    {resource.examData.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-xs hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <GithubIcon className="size-3.5 text-primary" />
                          <span className="font-medium text-foreground">{att.title}</span>
                        </div>
                        <span className="text-[11px] text-primary flex items-center gap-1">
                          Open Past Exams <ExternalLink className="size-3" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. LECTURE Preview */}
          {resource.type === "LECTURE" && resource.lectureData && (
            <div className="rounded-xl border bg-purple-500/5 border-purple-500/20 p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="size-3.5 text-purple-500" /> Schedule
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {formatDate(resource.lectureData.startTime)}
                  </p>
                </div>

                <div className="rounded-lg bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Video className="size-3.5 text-purple-500" /> Location / Meeting
                  </div>
                  <p className="font-semibold text-sm text-foreground">
                    {resource.lectureData.roomDetails || resource.lectureData.location}
                  </p>
                </div>
              </div>

              {resource.lectureData.meetingUrl && (
                <div className="flex justify-end">
                  <a
                    href={resource.lectureData.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
                  >
                    <Video className="size-4" /> Join Online Meeting
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Metadata Footer */}
          <div className="rounded-xl border bg-muted/10 p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Uploaded By:</span>
              <p className="mt-0.5 flex items-center gap-1">
                <User className="size-3 text-primary" /> {resource.ownerName}
              </p>
            </div>
            <div>
              <span className="font-medium text-foreground">Created:</span>
              <p className="mt-0.5">{formatDate(resource.createdAt)}</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Last Updated:</span>
              <p className="mt-0.5">{formatDate(resource.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t px-6 py-3 bg-muted/20">
          <span className="text-xs text-muted-foreground">
            UniHub Resource ID: <code className="font-mono text-[11px]">{resource.id.slice(0, 8)}...</code>
          </span>
          <Button size="sm" variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
