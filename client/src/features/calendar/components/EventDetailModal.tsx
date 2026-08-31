import { useState } from "react";
import {
  Bell,
  Calendar as CalendarIcon,
  Clock,
  ExternalLink,
  GraduationCap,
  Info,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { useCalendarEvent, useDeleteEvent } from "../api/events";
import { useCreateReminder, useDeleteReminder } from "../api/reminders";
import { useCalendarStore } from "../store/useCalendarStore";
import { getEventCategoryConfig } from "../utils/eventUtils";
import {
  formatFullDate,
  formatOffsetLabel,
  formatTime,
} from "@/lib/dateUtils";
import type { ReminderStatus } from "../api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

const STATIC_PRESETS = [
  { label: "15 minutes before", value: 15 },
  { label: "30 minutes before", value: 30 },
  { label: "1 hour before", value: 60 },
  { label: "12 hours before", value: 720 },
  { label: "1 day before", value: 1440 },
  { label: "1 week before", value: 10080 },
  { label: "1 month before", value: 43200 },
];

function renderStatusBadge(status: ReminderStatus) {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 font-medium"
        >
          Pending
        </Badge>
      );
    case "SENT":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-medium"
        >
          Sent
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="secondary"
          className="text-[10px] bg-muted text-muted-foreground font-medium"
        >
          Cancelled
        </Badge>
      );
  }
}

export function EventDetailModal() {
  const selectedEventId = useCalendarStore((s) => s.selectedEventId);
  const closeEventDetails = useCalendarStore((s) => s.closeEventDetails);
  const openEditModal = useCalendarStore((s) => s.openEditModal);

  const {
    data: event,
    isLoading,
    isError,
  } = useCalendarEvent(selectedEventId ?? "", {
    enabled: Boolean(selectedEventId),
  });

  const [reminderMode, setReminderMode] = useState<string>("15");
  const [customAmount, setCustomAmount] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours" | "days" | "weeks">("hours");
  const [reminderError, setReminderError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [currentTime] = useState(() => Date.now());

  const [searchParams, setSearchParams] = useSearchParams();

  const handleClose = () => {
    closeEventDetails();
    if (searchParams.has("eventId")) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("eventId");
          return next;
        },
        { replace: true },
      );
    }
  };

  const { mutate: deleteEventMutate, isPending: isDeleting } = useDeleteEvent();
  const { mutate: createReminderMutate, isPending: isCreatingReminder } =
    useCreateReminder();
  const { mutate: deleteReminderMutate, isPending: isDeletingReminder } =
    useDeleteReminder();

  if (!selectedEventId) return null;

  const isUrl = (val?: string) =>
    Boolean(val && (val.startsWith("http://") || val.startsWith("https://")));

  const startTimeMs = event?.startTime ? new Date(event.startTime).getTime() : 0;
  const timeUntilStartMinutes = Math.floor((startTimeMs - currentTime) / (1000 * 60));
  const isConcluded = Boolean(startTimeMs && startTimeMs <= currentTime);

  // Existing reminder offsets
  const existingOffsets = new Set(event?.reminders?.map((r) => r.offsetMinutes) ?? []);

  // Filter valid presets: offset must be strictly less than remaining time, and not already added
  const availablePresets = STATIC_PRESETS.filter(
    (preset) =>
      timeUntilStartMinutes - preset.value > 0 && !existingOffsets.has(preset.value),
  );

  // Compute calculated custom offset
  const computedCustomOffsetMinutes = (() => {
    const val = Math.max(1, customAmount);
    switch (customUnit) {
      case "minutes":
        return Math.max(15, Math.round(val / 15) * 15);
      case "hours":
        return val * 60;
      case "days":
        return val * 1440;
      case "weeks":
        return val * 10080;
    }
  })();

  const computedCustomTriggerDate = startTimeMs
    ? new Date(startTimeMs - computedCustomOffsetMinutes * 60 * 1000)
    : null;

  const handleAddReminder = () => {
    if (!event) return;
    setReminderError(null);

    let offsetToSubmit = 0;
    if (reminderMode === "custom") {
      offsetToSubmit = computedCustomOffsetMinutes;
    } else {
      offsetToSubmit = Number(reminderMode);
    }

    if (offsetToSubmit <= 0) {
      setReminderError("Please enter a valid interval");
      return;
    }

    if (offsetToSubmit % 15 !== 0) {
      setReminderError("Reminder intervals must be in 15-minute increments");
      return;
    }

    if (timeUntilStartMinutes - offsetToSubmit <= 0) {
      setReminderError("The reminder trigger time must be at least 15 minutes in the future");
      return;
    }

    if (existingOffsets.has(offsetToSubmit)) {
      setReminderError("A reminder with this exact interval is already scheduled");
      return;
    }

    createReminderMutate(
      {
        eventId: event.id,
        payload: { offsetMinutes: offsetToSubmit },
      },
      {
        onSuccess: () => {
          setReminderError(null);
          const next = availablePresets.find((p) => p.value !== offsetToSubmit);
          setReminderMode(next ? String(next.value) : "custom");
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to add reminder";
          setReminderError(msg);
        },
      },
    );
  };

  const handleRemoveReminder = () => {
    if (!event) return;
    deleteReminderMutate(event.id);
  };

  const handleDelete = () => {
    if (!event) return;
    deleteEventMutate(event.id, {
      onSuccess: () => {
        setIsConfirmingDelete(false);
        handleClose();
      },
    });
  };

  return (
    <Dialog
      open={Boolean(selectedEventId)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading event details...
            </p>
          </div>
        ) : isError || !event ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
            <p className="text-sm font-semibold text-destructive">
              Failed to load event details
            </p>
            <p className="text-xs text-muted-foreground">
              The event may have been removed or is no longer available.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="mt-3 text-xs"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            {(() => {
              const config = getEventCategoryConfig(event.type);
              const Icon = config.icon;
              const tag = event.courseAbbreviation?.trim() || event.courseSlug;

              return (
                <DialogHeader className="gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
                    <div className="flex flex-wrap items-center gap-2">
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

                      {event.studyYear && (
                        <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                          {event.studyYear}
                        </span>
                      )}

                      {isConcluded && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-muted text-muted-foreground border font-semibold uppercase tracking-wider"
                        >
                          Archived
                        </Badge>
                      )}
                    </div>

                    {/* Action buttons (Edit / Delete) */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (!isConcluded) openEditModal(event);
                        }}
                        disabled={isConcluded}
                        title={
                          isConcluded
                            ? "Concluded events cannot be edited"
                            : "Edit event"
                        }
                        className="text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
                        {event.communityName || event.communitySlug}
                      </Link>
                    </span>

                    {event.owner?.username && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <span>• Created by:</span>
                        <span className="inline-flex items-center gap-1 font-medium text-foreground">
                          <User className="size-3 text-muted-foreground" />
                          {event.owner.username}
                        </span>
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
              );
            })()}

            {/* Archived Notice Banner for Past Events */}
            {isConcluded && (
              <div className="rounded-xl border border-muted bg-muted/40 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
                <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Archived event: </span>
                  This event took place on {formatFullDate(event.startTime)} and is now concluded. Past events are locked and cannot be edited or scheduled with reminders.
                </div>
              </div>
            )}

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
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {isUrl(event.locationDetails) ? (
                        <a
                          href={event.locationDetails}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
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
                    {event.courseAbbreviation && (
                      <div className="text-xs text-muted-foreground font-mono">
                        Code: {event.courseAbbreviation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description / Notes */}
              {event.description && (
                <div className="rounded-xl border bg-muted/30 p-3 space-y-1 mt-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Description & Notes
                  </span>
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            <Separator className="my-1" />

            {/* Seamless Reminders Section (No Box) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <Bell className="size-3.5 text-primary" /> Reminders
                </span>

                {event.reminders && event.reminders.length > 0 && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {event.reminders.length} scheduled
                  </span>
                )}
              </div>

              {/* Reminders List */}
              {event.reminders && event.reminders.length > 0 ? (
                <div className="space-y-1.5">
                  {event.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex items-center justify-between py-1 px-0.5 text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-foreground">
                          {formatOffsetLabel(reminder.offsetMinutes)}
                        </span>
                        {reminder.remindAt && (
                          <span className="text-[11px] text-muted-foreground">
                            • {formatFullDate(reminder.remindAt)}, {formatTime(reminder.remindAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {renderStatusBadge(reminder.status)}

                        {!isConcluded && reminder.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveReminder()}
                            disabled={isDeletingReminder}
                            title="Remove reminder"
                            className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : isConcluded ? (
                <p className="text-[11px] text-muted-foreground italic">
                  Event has concluded. No new reminders can be scheduled.
                </p>
              ) : timeUntilStartMinutes < 15 ? (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  Event starts in less than 15 minutes. Reminders cannot be scheduled.
                </p>
              ) : (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Label className="text-[11px] font-semibold text-muted-foreground">
                    Set a Reminder
                  </Label>

                  {reminderError && (
                    <p className="text-[11px] text-destructive">{reminderError}</p>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="w-full sm:flex-1">
                        <Select
                          value={reminderMode}
                          onValueChange={(val: string | null) => {
                            if (val) {
                              setReminderMode(val);
                              setReminderError(null);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full h-8 text-xs bg-background">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePresets.map((opt) => (
                              <SelectItem key={opt.value} value={String(opt.value)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom interval...</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {reminderMode !== "custom" && (
                        <Button
                          size="sm"
                          onClick={handleAddReminder}
                          disabled={isCreatingReminder}
                          className="w-full sm:w-auto h-8 text-xs gap-1.5 font-semibold cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          Add Reminder
                        </Button>
                      )}
                    </div>

                    {/* Custom Interval Inputs (Inline, Unboxed) */}
                    {reminderMode === "custom" && (
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              Interval Amount
                            </Label>
                            <Input
                              type="number"
                              min={customUnit === "minutes" ? 15 : 1}
                              step={customUnit === "minutes" ? 15 : 1}
                              value={customAmount}
                              onChange={(e) => {
                                setCustomAmount(Math.max(1, parseInt(e.target.value, 10) || 1));
                                setReminderError(null);
                              }}
                              className="h-8 text-xs bg-background"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[11px] text-muted-foreground">
                              Unit (15m increments)
                            </Label>
                            <Select
                              value={customUnit}
                              onValueChange={(val: string | null) => {
                                if (val) {
                                  setCustomUnit(val as "minutes" | "hours" | "days" | "weeks");
                                  setReminderError(null);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full h-8 text-xs bg-background">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutes (step 15m)</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                                <SelectItem value="weeks">Weeks</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {computedCustomTriggerDate && (
                          <p className="text-[11px] text-muted-foreground">
                            Trigger time:{" "}
                            <span className="font-semibold text-foreground">
                              {formatFullDate(computedCustomTriggerDate.toISOString())} at{" "}
                              {formatTime(computedCustomTriggerDate.toISOString())}
                            </span>{" "}
                            ({formatOffsetLabel(computedCustomOffsetMinutes)})
                          </p>
                        )}

                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            onClick={handleAddReminder}
                            disabled={isCreatingReminder}
                            className="h-8 text-xs gap-1.5 font-semibold cursor-pointer"
                          >
                            <Plus className="size-3.5" />
                            Add Custom Reminder
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
