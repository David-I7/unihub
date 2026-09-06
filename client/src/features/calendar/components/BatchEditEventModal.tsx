import { useState, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { toDatetimeLocal } from "@/lib/dateUtils";
import {
  EVENT_TYPE_OPTIONS,
  EVENT_LOCATION_OPTIONS,
} from "../utils/eventUtils";
import type { BatchEventItemParsed } from "../schemas/eventSchemas";
import type { EventLocation } from "../api/types";

interface BatchEditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: BatchEventItemParsed | null;
  communityName: string;
  courseName: string;
  onSave: (updatedEvent: BatchEventItemParsed) => void;
}

const BATCH_TYPE_OPTIONS = EVENT_TYPE_OPTIONS.filter(
  (t) => t.value === "EXAM" || t.value === "LECTURE",
);

interface BatchEditEventFormProps {
  event: BatchEventItemParsed;
  communityName: string;
  courseName: string;
  onCancel: () => void;
  onSave: (updatedEvent: BatchEventItemParsed) => void;
}

function BatchEditEventForm({
  event,
  communityName,
  courseName,
  onCancel,
  onSave,
}: BatchEditEventFormProps) {
  const [title, setTitle] = useState(event.title ?? "");
  const [description, setDescription] = useState(event.description ?? "");
  const [type, setType] = useState<"EXAM" | "LECTURE">(event.type);
  const [startTime, setStartTime] = useState(() =>
    toDatetimeLocal(event.startTime),
  );
  const [durationHours, setDurationHours] = useState<number | "">(() =>
    typeof event.durationHours === "number" ? event.durationHours : "",
  );
  const [location, setLocation] = useState<EventLocation>(event.location);
  const [locationDetails, setLocationDetails] = useState(
    event.locationDetails ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeTypeOption = useMemo(() => {
    return BATCH_TYPE_OPTIONS.find((t) => t.value === type);
  }, [type]);

  const activeLocationOption = useMemo(() => {
    return EVENT_LOCATION_OPTIONS.find((l) => l.value === location);
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = "Event title is required";
    } else if (trimmedTitle.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    if (!startTime) {
      newErrors.startTime = "Start time is required";
    } else {
      const parsedDate = new Date(startTime);
      if (isNaN(parsedDate.getTime())) {
        newErrors.startTime = "Please enter a valid start date and time";
      } else if (parsedDate.getTime() < Date.now()) {
        newErrors.startTime = "Start time cannot be in the past";
      }
    }

    if (durationHours !== "") {
      const durNum = Number(durationHours);
      if (isNaN(durNum) || durNum <= 0) {
        newErrors.durationHours = "Duration must be greater than 0";
      } else if (durNum > 168) {
        newErrors.durationHours = "Duration cannot exceed 168 hours";
      }
    }

    if (description && description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    if (locationDetails && locationDetails.length > 500) {
      newErrors.locationDetails =
        "Location details must be 500 characters or less";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedEvent: BatchEventItemParsed = {
      courseId: event.courseId,
      title: trimmedTitle,
      description: description.trim() ? description.trim() : null,
      type,
      startTime: new Date(startTime).toISOString(),
      durationHours:
        typeof durationHours === "number" && durationHours > 0
          ? durationHours
          : null,
      location,
      locationDetails: locationDetails.trim() ? locationDetails.trim() : null,
    };

    onSave(updatedEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Locked Course & Community Context */}
      <div className="rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-foreground">
            Course & Community Selection
          </span>
          <span className="text-[11px] text-muted-foreground italic">
            Course context is locked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">
              Enrolled Community
            </Label>
            <Input
              value={communityName}
              disabled
              className="h-8 text-xs bg-muted/50 opacity-80 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Course</Label>
            <Input
              value={courseName || `Course #${event.courseId}`}
              disabled
              className="h-8 text-xs bg-muted/50 opacity-80 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Event Title */}
      <div className="space-y-1.5">
        <Label htmlFor="batch-event-title" className="text-xs font-semibold">
          Event Title *
        </Label>
        <Input
          id="batch-event-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: "" }));
            }
          }}
          placeholder="e.g. Curs: Geometrie și algebră liniară"
          className="text-xs h-9"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && (
          <p className="text-[11px] text-destructive">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="batch-event-desc" className="text-xs font-semibold">
          Description (Optional)
        </Label>
        <Textarea
          id="batch-event-desc"
          rows={3}
          placeholder="Add teacher information, lecture notes, or preparation guidelines..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) {
              setErrors((prev) => ({ ...prev, description: "" }));
            }
          }}
          className="text-xs resize-none"
        />
        {errors.description && (
          <p className="text-[11px] text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Type & Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Event Type *</Label>
          <Select
            value={type}
            onValueChange={(val: string | null) => {
              if (val === "EXAM" || val === "LECTURE") {
                setType(val);
              }
            }}
          >
            <SelectTrigger className="w-full h-9 text-xs bg-background">
              <SelectValue placeholder="Select type">
                {activeTypeOption && (
                  <div className="flex items-center gap-2">
                    <span>{activeTypeOption.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {BATCH_TYPE_OPTIONS.map((opt) => {
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2 text-xs">
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Location Format *</Label>
          <Select
            value={location}
            onValueChange={(val: string | null) => {
              if (val) setLocation(val as EventLocation);
            }}
          >
            <SelectTrigger className="w-full h-9 text-xs bg-background">
              <SelectValue placeholder="Select location format">
                {activeLocationOption && (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = activeLocationOption.icon;
                      return (
                        <Icon className="size-3.5 text-muted-foreground" />
                      );
                    })()}
                    <span>{activeLocationOption.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {EVENT_LOCATION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2 text-xs">
                      <Icon className="size-3.5 text-muted-foreground" />
                      <span>{opt.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Start Date Time & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="batch-event-start" className="text-xs font-semibold">
            Start Date & Time *
          </Label>
          <DateTimePicker
            id="batch-event-start"
            value={startTime}
            onChange={(val) => {
              setStartTime(val);
              if (errors.startTime) {
                setErrors((prev) => ({ ...prev, startTime: "" }));
              }
            }}
            placeholder="Select start date & time"
          />
          {errors.startTime && (
            <div className="flex items-center gap-1 text-[11px] text-destructive">
              <AlertCircle className="size-3 shrink-0" />
              <span>{errors.startTime}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="batch-event-dur" className="text-xs font-semibold">
            Duration (Hours)
          </Label>
          <Input
            id="batch-event-dur"
            type="number"
            step="0.5"
            min="0.5"
            max="168"
            placeholder="e.g. 2 (optional)"
            value={durationHours}
            onChange={(e) => {
              const val = e.target.value;
              setDurationHours(val ? parseFloat(val) : "");
              if (errors.durationHours) {
                setErrors((prev) => ({ ...prev, durationHours: "" }));
              }
            }}
            className="text-xs h-9"
          />
          {errors.durationHours && (
            <p className="text-[11px] text-destructive">
              {errors.durationHours}
            </p>
          )}
        </div>
      </div>

      {/* Location Details */}
      <div className="space-y-1.5">
        <Label htmlFor="batch-event-loc" className="text-xs font-semibold">
          Location Details / Meeting Link (Optional)
        </Label>
        <Input
          id="batch-event-loc"
          placeholder="e.g. Sala 111, Amfiteatrul 701, or Meeting URL"
          value={locationDetails}
          onChange={(e) => {
            setLocationDetails(e.target.value);
            if (errors.locationDetails) {
              setErrors((prev) => ({ ...prev, locationDetails: "" }));
            }
          }}
          className="text-xs h-9"
        />
        {errors.locationDetails && (
          <p className="text-[11px] text-destructive">
            {errors.locationDetails}
          </p>
        )}
      </div>

      {/* Footer Actions */}
      <DialogFooter className="gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
}

export function BatchEditEventModal({
  open,
  onOpenChange,
  event,
  communityName,
  courseName,
  onSave,
}: BatchEditEventModalProps) {
  const handleSave = (updated: BatchEventItemParsed) => {
    onSave(updated);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading">
            Edit Event Details
          </DialogTitle>
          <DialogDescription className="text-xs">
            Modify timing, location, or details for this imported event.
          </DialogDescription>
        </DialogHeader>

        {event && (
          <BatchEditEventForm
            key={`${event.courseId}-${event.startTime}-${event.title}`}
            event={event}
            communityName={communityName}
            courseName={courseName}
            onCancel={() => onOpenChange(false)}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
