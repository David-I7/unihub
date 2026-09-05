import { useState } from "react";
import {
  Clock,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { UserAvatar } from "@/components/app/UserAvatar";
import { useCalendarEvent } from "../api/events";
import { useCreateReminder, useDeleteReminder } from "../api/reminders";
import { useCalendarStore } from "../store/useCalendarStore";
import { DeleteEventDialog } from "./DeleteEventDialog";
import {
  EventLocationIcon,
  formatEventLocation,
  getEventCategoryConfig,
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
  SheetClose,
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
import { getErrorMessage } from "@/api/types";

const QUICK_PRESETS = [
  { label: "1h before", value: 60 },
  { label: "1d before", value: 1440 },
  { label: "1w before", value: 10080 },
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

  const queryEventId = selectedEventId;

  const {
    data: activeEvent,
    isLoading,
    isError,
  } = useCalendarEvent(queryEventId ?? "", {
    enabled: Boolean(queryEventId),
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
    setIsConfirmingDelete(false);
    setSelectedInterval(60);
    setCustomAmount(1);
    setCustomUnit("hours");
    setReminderError(null);
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

  const { mutate: createReminderMutate, isPending: isCreatingReminder } =
    useCreateReminder();
  const { mutate: deleteReminderMutate, isPending: isDeletingReminder } =
    useDeleteReminder();

  const { canEditEvent, canDeleteEvent } = usePermissions(
    activeEvent?.communitySlug,
  );

  const isUrl = (val?: string) =>
    Boolean(val && (val.startsWith("http://") || val.startsWith("https://")));

  const startTimeMs = activeEvent?.startTime
    ? new Date(activeEvent.startTime).getTime()
    : 0;
  const timeUntilStartMinutes = Math.floor(
    (startTimeMs - currentTime) / (1000 * 60),
  );
  const isConcluded = Boolean(startTimeMs && startTimeMs <= currentTime);

  const relativeStatus = activeEvent
    ? formatEventRelativeStatus(
        activeEvent.startTime,
        activeEvent.durationHours,
      )
    : { label: "", isPast: false, isOngoing: false, isSoon: false };

  const activeReminder = activeEvent?.reminders?.[0];

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
    if (!activeEvent) return;
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
        "Event reminders must be scheduled at least 15 minutes before the event starts",
      );
      return;
    }

    createReminderMutate(
      {
        eventId: activeEvent.id,
        payload: { offsetMinutes: offsetToSubmit },
      },
      {
        onSuccess: () => {
          setReminderError(null);
          toast.success("Reminder scheduled successfully");
        },
        onError: (err: unknown) => {
          const msg = getErrorMessage(err, "Failed to set reminder");
          setReminderError(msg);
          toast.error(msg);
        },
      },
    );
  };

  const handleRemoveReminder = () => {
    if (!activeEvent) return;
    deleteReminderMutate(activeEvent.id, {
      onSuccess: () => toast.success("Reminder removed successfully"),
      onError: () => toast.error("Failed to remove reminder"),
    });
  };

  const config = activeEvent ? getEventCategoryConfig(activeEvent.type) : null;
  const Icon = config?.icon;
  const timeStr = activeEvent
    ? formatEventTimeWithDuration(
        activeEvent.startTime,
        activeEvent.type !== "ASSIGNMENT"
          ? activeEvent.durationHours
          : undefined,
      )
    : "";
  const abbreviation = activeEvent?.courseAbbreviation?.trim();

  const isAuthorizedToEdit =
    Boolean(activeEvent) &&
    !isConcluded &&
    canEditEvent(activeEvent?.owner?.id);
  const isAuthorizedToDelete =
    Boolean(activeEvent) && canDeleteEvent(activeEvent?.owner?.id);
  const hasActions = isAuthorizedToEdit || isAuthorizedToDelete;

  return (
    <Sheet
      open={Boolean(selectedEventId)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full sm:max-w-md overflow-y-auto p-5 sm:p-6 focus:outline-none"
      >
        {isLoading && !activeEvent ? (
          <div className="relative flex flex-col items-center justify-center py-20 gap-3">
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-0 right-0 size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Close sheet"
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Close</span>
                </Button>
              }
            />
            <Spinner className="size-6 text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading event details...
            </p>
          </div>
        ) : isError ? (
          <div className="relative flex flex-col items-center justify-center py-16 gap-2 text-center">
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-0 right-0 size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Close sheet"
                >
                  <X className="size-3.5" />
                  <span className="sr-only">Close</span>
                </Button>
              }
            />
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
        ) : activeEvent && config && Icon ? (
          <div className="space-y-5 text-xs">
            {/* Header: Badges on left; 3-Dots + Close on right */}
            <SheetHeader className="space-y-2 p-0">
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

                <div className="flex items-center gap-1 shrink-0">
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
                            onClick={() => openEditModal(activeEvent)}
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

                  <SheetClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Close sheet"
                      >
                        <X className="size-3.5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Title */}
              <SheetTitle className="text-lg font-bold font-heading text-foreground leading-snug text-left">
                {activeEvent.title}
              </SheetTitle>

              {/* Creator & Community Subtitle */}
              <SheetDescription className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-left">
                {activeEvent.owner?.username && (
                  <>
                    Created by
                    <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                      <UserAvatar
                        username={activeEvent.owner.username}
                        size="xxs"
                      />
                      <span>{activeEvent.owner.username}</span>
                    </span>
                  </>
                )}
              </SheetDescription>
            </SheetHeader>

            <Separator />

            {/* SCHEDULE */}
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Schedule
              </div>
              <div className="font-semibold text-foreground">
                {formatFullDate(activeEvent.startTime)}
              </div>
              <div className="text-muted-foreground font-mono text-xs">
                {timeStr}
                {activeEvent.durationHours ? (
                  <span className="text-muted-foreground/80 ml-1 font-sans">
                    ({formatDurationHours(activeEvent.durationHours)})
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
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground">
                  <EventLocationIcon
                    location={activeEvent.location}
                    className="size-3.5 text-muted-foreground"
                  />
                  <span>{formatEventLocation(activeEvent.location)}</span>
                </span>
              </div>
              {activeEvent.locationDetails && (
                <div className="text-xs text-muted-foreground pt-0.5">
                  {isUrl(activeEvent.locationDetails) ? (
                    <a
                      href={activeEvent.locationDetails}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                    >
                      <span>{activeEvent.locationDetails}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span>{activeEvent.locationDetails}</span>
                  )}
                </div>
              )}
            </div>

            {/* COURSE */}
            {activeEvent.courseName && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Course
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    {activeEvent.communityName}
                    {activeEvent.studyYear && (
                      <span className="text-muted-foreground">
                        {" "}
                        • {activeEvent.studyYear}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {abbreviation && (
                      <span className="font-mono text-[11px] font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {abbreviation}
                      </span>
                    )}
                    <span className="font-semibold text-foreground">
                      {activeEvent.courseName}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/communities/${activeEvent.communitySlug}/courses/${activeEvent.courseSlug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <span>View Course Page</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            )}

            {/* Description */}
            {activeEvent.description && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Description
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {activeEvent.description}
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
                  <div className="flex items-center flex-1 justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {formatOffsetLabel(activeReminder.offsetMinutes)}
                    </span>

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
        ) : null}
      </SheetContent>

      <DeleteEventDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        event={activeEvent ?? null}
        onDeleted={handleClose}
      />
    </Sheet>
  );
}
