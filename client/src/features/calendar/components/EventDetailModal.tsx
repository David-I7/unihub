import { useState } from "react";
import {
  Bell,
  BellOff,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  GraduationCap,
  MapPin,
  Pencil,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Link } from "react-router";
import { useDeleteEvent } from "../api/events";
import { useCreateReminder, useDeleteReminder } from "../api/reminders";
import type { CalendarEvent } from "../api/types";
import { getEventCategoryConfig } from "./CalendarEventPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
}

const REMINDER_OFFSETS = [
  { label: "15 minutes before", value: "15" },
  { label: "30 minutes before", value: "30" },
  { label: "1 hour before", value: "60" },
  { label: "1 day before", value: "1440" },
];

function formatFullDate(isoStr?: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(isoStr?: string): string {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  onEdit,
}: EventDetailModalProps) {
  const [selectedOffset, setSelectedOffset] = useState("15");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const { mutate: deleteEventMutate, isPending: isDeleting } = useDeleteEvent();
  const { mutate: createReminderMutate, isPending: isCreatingReminder } =
    useCreateReminder();
  const { mutate: deleteReminderMutate, isPending: isDeletingReminder } =
    useDeleteReminder();

  if (!event) return null;

  const config = getEventCategoryConfig(event.type);
  const Icon = config.icon;
  const isUrl =
    event.locationDetails?.startsWith("http://") ||
    event.locationDetails?.startsWith("https://");
  const tag = event.courseAbbreviation?.trim() || event.courseSlug;

  const handleSetReminder = () => {
    createReminderMutate({
      eventId: event.id,
      payload: { offsetMinutes: Number(selectedOffset) },
    });
  };

  const handleRemoveReminder = () => {
    deleteReminderMutate({
      eventId: event.id,
      reminderId: event.reminders?.[0]?.id,
    });
  };

  const handleDelete = () => {
    deleteEventMutate(event.id, {
      onSuccess: () => {
        setIsConfirmingDelete(false);
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <DialogHeader className="gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`gap-1.5 px-2.5 py-1 text-xs font-bold border-current/30 ${config.container}`}
              >
                <Icon className="size-3.5" />
                {config.label}
              </Badge>

              {tag && (
                <span className="font-mono text-xs font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {tag}
                </span>
              )}
            </div>

            {/* Action buttons (Edit / Delete) */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  onEdit(event);
                }}
                title="Edit event"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Pencil className="size-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsConfirmingDelete(true)}
                title="Delete event"
                className="text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <DialogTitle className="text-xl font-bold font-heading text-foreground mt-1">
            {event.title}
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span>Community:</span>
              <Link
                to={`/communities/${event.communitySlug}`}
                className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
              >
                <Users className="size-3" />
                {event.communitySlug}
              </Link>
            </span>

            {event.owner?.username && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <UserIcon className="size-3" />
                <span>@{event.owner.username}</span>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Delete Confirmation Alert */}
        {isConfirmingDelete && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 space-y-2 animate-in fade-in">
            <p className="text-xs font-medium text-destructive">
              Are you sure you want to delete this event? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmingDelete(false)}
                className="h-7 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 text-xs cursor-pointer font-semibold"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        )}

        <Separator className="my-1" />

        {/* Event Schedule Info */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 text-muted-foreground">
            <CalendarIcon className="size-4 mt-0.5 text-primary shrink-0" />
            <div>
              <div className="font-semibold text-foreground">
                {formatFullDate(event.startTime)}
              </div>
              <div className="text-xs flex items-center gap-2 mt-0.5">
                <Clock className="size-3" />
                <span>
                  {formatTime(event.startTime)}
                  {event.endTime ? ` - ${formatTime(event.endTime)}` : ""}
                </span>
                {event.durationMinutes ? (
                  <span className="text-muted-foreground">
                    ({event.durationMinutes} min)
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-start gap-3 text-muted-foreground">
            <MapPin className="size-4 mt-0.5 text-primary shrink-0" />
            <div>
              <div className="font-semibold text-foreground capitalize">
                {event.location.toLowerCase().replace("_", " ")}
              </div>
              {event.locationDetails && (
                <div className="text-xs mt-0.5">
                  {isUrl ? (
                    <a
                      href={event.locationDetails}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      {event.locationDetails}
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span>{event.locationDetails}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Course Info */}
          {event.courseName && (
            <div className="flex items-start gap-3 text-muted-foreground">
              <GraduationCap className="size-4 mt-0.5 text-primary shrink-0" />
              <div>
                <div className="font-semibold text-foreground">
                  {event.courseName}
                </div>
                {tag && (
                  <div className="text-xs text-muted-foreground font-mono">
                    Code: {tag}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description / Notes */}
          {event.description && (
            <div className="mt-3 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap border">
              {event.description}
            </div>
          )}
        </div>

        <Separator className="my-1" />

        {/* Reminder Controls Section */}
        <div className="rounded-xl border bg-muted/20 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Bell className="size-3.5 text-primary" /> Event Reminders
            </span>

            {event.isSubscribed && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-primary/10 text-primary border-primary/20"
              >
                Reminder Active
              </Badge>
            )}
          </div>

          {event.isSubscribed ? (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-muted-foreground">
                {event.reminders?.[0]?.offsetMinutes
                  ? `Notifying ${event.reminders[0].offsetMinutes} min before event`
                  : "Notification scheduled"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveReminder}
                disabled={isDeletingReminder}
                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
              >
                <BellOff className="size-3.5" />
                {isDeletingReminder ? "Removing..." : "Remove"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <div className="w-full sm:flex-1">
                <Select
                  value={selectedOffset}
                  onValueChange={(val: string | null) => {
                    if (val) setSelectedOffset(val);
                  }}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-background">
                    <SelectValue placeholder="Select reminder offset" />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_OFFSETS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="sm"
                onClick={handleSetReminder}
                disabled={isCreatingReminder}
                className="w-full sm:w-auto h-8 text-xs gap-1.5 font-semibold cursor-pointer"
              >
                <Bell className="size-3.5" />
                {isCreatingReminder ? "Setting..." : "Set Reminder"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
