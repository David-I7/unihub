import { useNavigate } from "react-router";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Video,
  AlertCircle,
  BookOpen,
  ExternalLink,
  Star,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MockCalendarEvent } from "../data/mockCalendarData";

interface ProtoEventDetailModalProps {
  event: MockCalendarEvent | null;
  onClose: () => void;
  onDeleteEvent?: (id: string) => void;
  onToggleStar?: (id: string) => void;
}

export function ProtoEventDetailModal({
  event,
  onClose,
  onDeleteEvent,
  onToggleStar,
}: ProtoEventDetailModalProps) {
  const navigate = useNavigate();

  if (!event) return null;

  const isExam = event.type === "EXAM";
  const isAssignment = event.type === "ASSIGNMENT";
  const isLecture = event.type === "LECTURE";

  const courseUrl = `/proto/communities/${event.communityId}/year/${event.studyYearId}/course/${event.courseOfferingId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        {/* Header */}
        <div
          className={`border-b p-6 text-white ${
            isExam
              ? "bg-gradient-to-r from-rose-700 via-red-800 to-slate-900"
              : isAssignment
              ? "bg-gradient-to-r from-amber-600 via-orange-700 to-slate-900"
              : "bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                {isExam && <AlertCircle className="size-3.5" />}
                {isAssignment && <FileText className="size-3.5" />}
                {isLecture && <Video className="size-3.5" />}
                {event.type}
              </span>
              <span className="rounded bg-black/30 px-2 py-0.5 font-mono text-xs font-bold">
                {event.courseAbbr}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {onToggleStar && (
                <button
                  type="button"
                  onClick={() => onToggleStar(event.id)}
                  className="p-1 rounded text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Bookmark event"
                >
                  <Star
                    className={`size-4 ${
                      event.isStarred ? "fill-amber-400 text-amber-400" : ""
                    }`}
                  />
                </button>
              )}
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={onClose}
                className="text-white hover:bg-white/20 hover:text-white"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <h2 className="mt-3 font-heading text-xl font-bold tracking-tight">
            {event.title}
          </h2>
          <p className="mt-1 text-xs text-white/80">
            {event.courseName} • {event.communityName}
          </p>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Key Quick Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" /> Date
              </span>
              <p className="font-bold text-foreground">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="size-3.5 text-primary" /> Time
              </span>
              <p className="font-bold text-foreground font-mono">
                {event.startTime} {event.endTime ? ` - ${event.endTime}` : ""}
              </p>
            </div>

            {event.gradeWeight !== undefined && (
              <div className="rounded-xl border bg-muted/20 p-3 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" /> Grade Weight
                </span>
                <p className="font-bold text-primary text-sm">
                  {event.gradeWeight}%
                </p>
              </div>
            )}
          </div>

          {/* Location / Meeting Room */}
          {(event.roomOrPlatform || event.meetingUrl) && (
            <div className="rounded-xl border bg-muted/15 p-4 space-y-2">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="size-4 text-primary" /> Location & Access
              </span>
              <p className="text-muted-foreground">
                {event.roomOrPlatform || (event.locationType === "ONLINE" ? "Online Meeting" : "Faculty Building")}
              </p>
              {event.meetingUrl && (
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                >
                  <Video className="size-3.5" /> Join Live Google Meet
                </a>
              )}
            </div>
          )}

          {/* Description / Syllabus Notes */}
          {event.description && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-foreground">Overview & Syllabus Details</h4>
              <p className="text-muted-foreground leading-relaxed rounded-xl border bg-muted/10 p-3.5">
                {event.description}
              </p>
            </div>
          )}

          {/* Passing Tips / Notes */}
          {event.passingNotes && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
              <span className="font-bold text-primary flex items-center gap-1.5">
                💡 Passing Shortcut / Syllabus Rule
              </span>
              <p className="text-muted-foreground leading-relaxed">
                {event.passingNotes}
              </p>
            </div>
          )}

          {/* Attachments */}
          {event.attachments && event.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">Attached Materials</h4>
              <div className="space-y-1.5">
                {event.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-lg border bg-background p-2.5 shadow-2xs"
                  >
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      {att.title}
                    </span>
                    {att.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        Open <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LINK TO THE COURSE OFFERING (Main Requirement) */}
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <BookOpen className="size-4 text-primary" /> {event.courseName}
              </span>
              <p className="text-muted-foreground">
                Visit the full Course Hub: VS Code materials explorer, exam formulas & teacher ratings.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => {
                onClose();
                navigate(courseUrl);
              }}
              className="gap-1.5 shrink-0 shadow-xs font-semibold"
            >
              Open Course Hub ↗
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t px-6 py-3 bg-muted/20 text-xs">
          <div>
            {onDeleteEvent && (
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  onDeleteEvent(event.id);
                  onClose();
                }}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-1"
              >
                <Trash2 className="size-3.5" /> Delete Event
              </Button>
            )}
          </div>

          <Button size="sm" variant="default" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
