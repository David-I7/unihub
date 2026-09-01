import { useState } from "react";
import {
  Clock,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { UserAvatar } from "@/components/app/UserAvatar";
import { useCalendarEvent, useDeleteEvent } from "../api/events";
import { useCreateReminder, useDeleteReminder } from "../api/reminders";
import { useCalendarStore } from "../store/useCalendarStore";
import {
  formatEventLocation,
  getEventCategoryConfig,
  getEventLocationIcon,
} from "../utils/eventUtils";
import {
  formatDurationHours,
  formatEventRelativeStatus,
  formatEventTimeWithDuration,
  formatFullDate,
  formatOffsetLabel,
  formatTime,
} from "@/lib/dateUtils";
import type { ReminderStatus } from "../api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

const QUICK_PRESETS = [
  { label: "15m before", value: 15 },
  { label: "1h before", value: 60 },
  { label: "1d before", value: 1440 },
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

export function EventDetailSheet() {
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

  const [selectedInterval, setSelectedInterval] = useState<number | "custom">(
    60,
  );
  const [customAmount, setCustomAmount] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<
    "minutes" | "hours" | "days" | "weeks"
  >("hours");
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

  const { canEditEvent, canDeleteEvent } = usePermissions(event?.communitySlug);

  const isUrl = (val?: string) =>
    Boolean(val && (val.startsWith("http://") || val.startsWith("https://")));

  const startTimeMs = event?.startTime
    ? new Date(event.startTime).getTime()
    : 0;
  const timeUntilStartMinutes = Math.floor(
    (startTimeMs - currentTime) / (1000 * 60),
  );
  const isConcluded = Boolean(startTimeMs && startTimeMs <= currentTime);

  const relativeStatus = event
    ? formatEventRelativeStatus(event.startTime, event.durationHours)
    : { label: "", isPast: false, isOngoing: false, isSoon: false };

  const activeReminder = event?.reminders?.[0];

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

  const handleSetReminder = () => {
    if (!event) return;
    setReminderError(null);

    const offsetToSubmit =
      selectedInterval === "custom"
        ? computedCustomOffsetMinutes
        : selectedInterval;

    if (offsetToSubmit <= 0) {
      setReminderError("Please enter a valid interval");
      return;
    }

    if (offsetToSubmit % 15 !== 0) {
      setReminderError("Reminder intervals must be in 15-minute increments");
      return;
    }

    if (timeUntilStartMinutes - offsetToSubmit <= 0) {
      setReminderError(
        "The reminder trigger time must be at least 15 minutes in the future",
      );
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
          toast.success("Reminder scheduled successfully");
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "Failed to set reminder";
          setReminderError(msg);
          toast.error(msg);
        },
      },
    );
  };

  const handleRemoveReminder = () => {
    if (!event) return;
    deleteReminderMutate(event.id, {
      onSuccess: () => toast.success("Reminder removed"),
      onError: () => toast.error("Failed to remove reminder"),
    });
  };

  const handleDelete = () => {
    if (!event) return;
    deleteEventMutate(event.id, {
      onSuccess: () => {
        setIsConfirmingDelete(false);
        toast.success("Event deleted");
        handleClose();
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to delete event",
        );
      },
    });
  };

  const config = event ? getEventCategoryConfig(event.type) : null;
  const Icon = config?.icon;
  const LocationIcon = event ? getEventLocationIcon(event.location) : null;
  const timeStr = event
    ? formatEventTimeWithDuration(event.startTime, event.durationHours)
    : "";
  const abbreviation = event?.courseAbbreviation?.trim();

  const isAuthorizedToEdit =
    Boolean(event) && !isConcluded && canEditEvent(event?.owner?.id);
  const isAuthorizedToDelete =
    Boolean(event) && canDeleteEvent(event?.owner?.id);
  const hasActions = isAuthorizedToEdit || isAuthorizedToDelete;

  return (
    <Sheet
      open={Boolean(selectedEventId)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-5 sm:p-6"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner className="size-6 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading event details...
            </p>
          </div>
        ) : isError || !event || !config || !Icon || !LocationIcon ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
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
              className="mt-3 text-xs cursor-pointer"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-5 text-xs">
            {/* Header: Category Badge + Countdown Badge on left; 3-Dots on right */}
            <SheetHeader className="space-y-2 p-0 pr-8">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 font-bold tracking-wide",
                      config.badge,
                      "px-2 py-0.5 rounded-md",
                    )}
                  >
                    <Icon className="size-3 shrink-0" />
                    <span>{config.label}</span>
                  </span>

                  {relativeStatus.label && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "gap-1 text-[11px] font-medium h-5 px-1.5",
                        relativeStatus.isOngoing &&
                          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-bold",
                        relativeStatus.isSoon &&
                          !relativeStatus.isOngoing &&
                          "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold",
                        relativeStatus.isPast &&
                          "bg-muted text-muted-foreground",
                      )}
                    >
                      <Clock className="size-2.5" />
                      <span>{relativeStatus.label}</span>
                    </Badge>
                  )}
                </div>

                {hasActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Event options"
                        >
                          <MoreVertical className="size-3.5" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-36">
                      {isAuthorizedToEdit && (
                        <DropdownMenuItem
                          onClick={() => openEditModal(event)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Pencil className="size-3.5 text-muted-foreground" />
                          <span>Edit Event</span>
                        </DropdownMenuItem>
                      )}

                      {isAuthorizedToEdit && isAuthorizedToDelete && (
                        <DropdownMenuSeparator />
                      )}

                      {isAuthorizedToDelete && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setIsConfirmingDelete(true)}
                          className="gap-2 cursor-pointer text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete Event</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Title */}
              <SheetTitle className="text-lg font-bold font-heading text-foreground leading-snug text-left">
                {event.title}
              </SheetTitle>

              {/* Creator & Community Subtitle */}
              <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-left">
                {event.owner?.username && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                    <UserAvatar
                      username={event.owner.username}
                      size="xs"
                      className="size-4 border-0"
                    />
                    <span>@{event.owner.username}</span>
                  </span>
                )}
                {event.communityName && (
                  <span>
                    {event.owner?.username ? "• " : ""}
                    {event.communityName}
                  </span>
                )}
              </SheetDescription>
            </SheetHeader>

            {/* Delete Confirmation Alert */}
            {isConfirmingDelete && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 space-y-2">
                <p className="text-xs font-semibold text-destructive">
                  Are you sure you want to delete this event? This action cannot
                  be undone.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="h-7 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
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

            <Separator />

            {/* SCHEDULE */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Schedule
              </div>
              <div className="font-semibold text-foreground">
                {formatFullDate(event.startTime)}
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                {timeStr}
                {event.durationHours ? (
                  <span className="text-muted-foreground/80 ml-1 font-sans">
                    ({formatDurationHours(event.durationHours)})
                  </span>
                ) : null}
              </div>
            </div>

            {/* LOCATION */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Location
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-xs font-semibold text-foreground">
                  <LocationIcon className="size-3.5 text-muted-foreground" />
                  <span>{formatEventLocation(event.location)}</span>
                </span>
              </div>
              {event.locationDetails && (
                <div className="text-xs text-muted-foreground pt-0.5">
                  {isUrl(event.locationDetails) ? (
                    <a
                      href={event.locationDetails}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <span>{event.locationDetails}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span>{event.locationDetails}</span>
                  )}
                </div>
              )}
            </div>

            {/* COURSE */}
            {event.courseName && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Course
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {abbreviation && (
                      <span className="font-mono text-[11px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                        [{abbreviation}]
                      </span>
                    )}
                    <span className="font-semibold text-foreground">
                      {event.courseName}
                    </span>
                    {event.studyYear && (
                      <span className="text-muted-foreground">
                        • {event.studyYear}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/communities/${event.communitySlug}/courses/${event.courseSlug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>View Course Page</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>
            )}

            {/* Description & Instructions */}
            {event.description && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Description & Instructions
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            <Separator />

            {/* REMINDERS */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Reminders
              </div>

              {activeReminder ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/20 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      Scheduled:{" "}
                      {formatOffsetLabel(activeReminder.offsetMinutes)}
                    </span>
                    {activeReminder.remindAt && (
                      <span className="text-muted-foreground text-[11px]">
                        ({formatFullDate(activeReminder.remindAt)} at{" "}
                        {formatTime(activeReminder.remindAt)})
                      </span>
                    )}
                    {renderStatusBadge(activeReminder.status)}
                  </div>

                  {!isConcluded && activeReminder.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={handleRemoveReminder}
                      disabled={isDeletingReminder}
                      title="Remove reminder"
                      className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ) : isConcluded ? (
                <p className="text-muted-foreground italic">
                  Event has concluded. No reminders can be scheduled.
                </p>
              ) : timeUntilStartMinutes < 15 ? (
                <p className="text-amber-600 dark:text-amber-400">
                  Event starts in less than 15 minutes. Reminders cannot be
                  scheduled.
                </p>
              ) : (
                <div className="space-y-2">
                  {reminderError && (
                    <p className="text-destructive text-[11px]">
                      {reminderError}
                    </p>
                  )}

                  {/* Toggleable Option Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {QUICK_PRESETS.map((preset) => {
                      const isSelected = selectedInterval === preset.value;
                      return (
                        <Button
                          key={preset.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          size="xs"
                          onClick={() => setSelectedInterval(preset.value)}
                          className="h-7 text-xs cursor-pointer font-medium"
                        >
                          {preset.label}
                        </Button>
                      );
                    })}
                    <Button
                      type="button"
                      variant={
                        selectedInterval === "custom" ? "default" : "outline"
                      }
                      size="xs"
                      onClick={() =>
                        setSelectedInterval(
                          selectedInterval === "custom" ? 60 : "custom",
                        )
                      }
                      className="h-7 text-xs cursor-pointer font-medium"
                    >
                      Custom Interval
                    </Button>
                  </div>

                  {/* Custom Interval Inputs (visible only when custom is selected) */}
                  {selectedInterval === "custom" && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">
                            Amount
                          </Label>
                          <Input
                            type="number"
                            min={customUnit === "minutes" ? 15 : 1}
                            step={customUnit === "minutes" ? 15 : 1}
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(
                                Math.max(1, parseInt(e.target.value, 10) || 1),
                              );
                              setReminderError(null);
                            }}
                            className="h-8 text-xs bg-background"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] text-muted-foreground">
                            Unit
                          </Label>
                          <Select
                            value={customUnit}
                            onValueChange={(val: string | null) => {
                              if (val) {
                                setCustomUnit(
                                  val as "minutes" | "hours" | "days" | "weeks",
                                );
                                setReminderError(null);
                              }
                            }}
                          >
                            <SelectTrigger className="w-full h-8 text-xs bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutes">Minutes</SelectItem>
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
                            {formatFullDate(
                              computedCustomTriggerDate.toISOString(),
                            )}{" "}
                            at{" "}
                            {formatTime(
                              computedCustomTriggerDate.toISOString(),
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Set Reminder Button */}
                  <div className="flex justify-end pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSetReminder}
                      disabled={isCreatingReminder}
                      className="h-7 text-xs font-semibold cursor-pointer"
                    >
                      {isCreatingReminder ? "Setting..." : "Set Reminder"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
