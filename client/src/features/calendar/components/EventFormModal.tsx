import { useEffect, useState } from "react";
import { useUserCommunities } from "@/features/users";
import { useStudyYearDetail } from "@/features/studyYears/api/getStudyYearDetail";
import { useCreateEvent, useUpdateEvent } from "../api/events";
import type {
  CalendarEvent,
  CreateEventPayload,
  EventLocation,
  EventType,
  UpdateEventPayload,
} from "../api/types";
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

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  editingEvent?: CalendarEvent | null;
  defaultCommunitySlug?: string;
}

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: "Exam", value: "EXAM" },
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Lecture", value: "LECTURE" },
];

const LOCATION_TYPES: { label: string; value: EventLocation }[] = [
  { label: "In-Person", value: "IN_PERSON" },
  { label: "Online", value: "ONLINE" },
  { label: "Hybrid", value: "HYBRID" },
];

const STUDY_YEARS = ["year-1", "year-2", "year-3", "year-4"];

function toDatetimeLocal(isoStr?: string, defaultDateStr?: string): string {
  if (isoStr) {
    const d = new Date(isoStr);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const h = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${day}T${h}:${min}`;
    }
  }

  if (defaultDateStr) {
    return `${defaultDateStr}T09:00`;
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T09:00`;
}

export function EventFormModal({
  isOpen,
  onClose,
  defaultDate,
  editingEvent,
  defaultCommunitySlug,
}: EventFormModalProps) {
  const isEditing = Boolean(editingEvent);

  const { data: userCommunitiesData } = useUserCommunities();
  const communities = userCommunitiesData?.communities ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("EXAM");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<number | undefined>(
    undefined,
  );
  const [location, setLocation] = useState<EventLocation>("IN_PERSON");
  const [locationDetails, setLocationDetails] = useState("");
  const [communitySlug, setCommunitySlug] = useState("");
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [formStudyYear, setFormStudyYear] = useState<string>("year-1");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch courses for the selected community & study year
  const { data: studyYearDetail } = useStudyYearDetail(
    communitySlug,
    formStudyYear,
    { includeArchived: false },
  );
  const availableCourses = studyYearDetail?.courses ?? [];
  const effectiveCourseId =
    courseId ?? (availableCourses.length > 0 ? availableCourses[0].course.id : undefined);

  // Mutations
  const { mutate: createEventMutate, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEventMutate, isPending: isUpdating } = useUpdateEvent();
  const isSubmitting = isCreating || isUpdating;

  // Initialize or reset form state on open / change
  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);

    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description ?? "");
      setType(editingEvent.type);
      setStartTime(toDatetimeLocal(editingEvent.startTime));
      setEndTime(
        editingEvent.endTime ? toDatetimeLocal(editingEvent.endTime) : "",
      );
      setDurationMinutes(editingEvent.durationMinutes);
      setLocation(editingEvent.location);
      setLocationDetails(editingEvent.locationDetails ?? "");
      setCommunitySlug(editingEvent.communitySlug);
      setCourseId(editingEvent.courseId);
    } else {
      setTitle("");
      setDescription("");
      setType("EXAM");
      const initStart = toDatetimeLocal(undefined, defaultDate);
      setStartTime(initStart);
      setEndTime("");
      setDurationMinutes(undefined);
      setLocation("IN_PERSON");
      setLocationDetails("");

      const initialComm =
        defaultCommunitySlug || communities[0]?.slug || "";
      setCommunitySlug(initialComm);
      setCourseId(undefined);
    }
  }, [isOpen, editingEvent, defaultDate, defaultCommunitySlug, communities]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError("Please enter an event title");
      return;
    }

    if (!startTime) {
      setValidationError("Please select a start date and time");
      return;
    }

    const startIso = new Date(startTime).toISOString();
    let endIso: string | undefined = undefined;

    if (endTime) {
      const endD = new Date(endTime);
      const startD = new Date(startTime);
      if (endD <= startD) {
        setValidationError("End time must be after start time");
        return;
      }
      endIso = endD.toISOString();
    }

    if (isEditing && editingEvent) {
      const payload: UpdateEventPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startTime: startIso,
        endTime: endIso,
        durationMinutes: durationMinutes || undefined,
        location,
        locationDetails: locationDetails.trim() || undefined,
      };

      updateEventMutate(
        { id: editingEvent.id, payload },
        {
          onSuccess: () => {
            onClose();
          },
          onError: (err: unknown) => {
            const message =
              err instanceof Error ? err.message : "Failed to update event";
            setValidationError(message);
          },
        },
      );
    } else {
      if (!communitySlug) {
        setValidationError("Please select an enrolled community");
        return;
      }
      if (!effectiveCourseId) {
        setValidationError("Please select a course");
        return;
      }

      const payload: CreateEventPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        type,
        startTime: startIso,
        endTime: endIso,
        durationMinutes: durationMinutes || undefined,
        location,
        locationDetails: locationDetails.trim() || undefined,
        communitySlug,
        courseId: effectiveCourseId,
      };

      createEventMutate(payload, {
        onSuccess: () => {
          onClose();
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to create event";
          setValidationError(message);
        },
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-heading">
            {isEditing ? "Edit Calendar Event" : "Create New Event"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Update details, timing, or location for this event."
              : "Schedule an exam, assignment deadline, or lecture session."}
          </DialogDescription>
        </DialogHeader>

        {validationError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="event-title" className="text-xs font-semibold">
              Event Title *
            </Label>
            <Input
              id="event-title"
              placeholder="e.g. Midterm Examination, Assignment 1 Submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9"
              required
            />
          </div>

          {/* Event Type & Location Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Event Type *</Label>
              <Select
                value={type}
                onValueChange={(val: string | null) => {
                  if (val) setType(val as EventType);
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start & End Date Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-start" className="text-xs font-semibold">
                Start Date & Time *
              </Label>
              <DateTimePicker
                id="event-start"
                value={startTime}
                onChange={(val) => setStartTime(val)}
                placeholder="Select start date & time"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-end" className="text-xs font-semibold">
                End Date & Time (Optional)
              </Label>
              <DateTimePicker
                id="event-end"
                value={endTime}
                onChange={(val) => setEndTime(val)}
                placeholder="Select end date & time"
                clearable
              />
            </div>
          </div>

          {/* Location Details & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="event-loc" className="text-xs font-semibold">
                Location Details / Meeting Link
              </Label>
              <Input
                id="event-loc"
                placeholder="e.g. Amphitheater 2, Room 301, Google Meet URL"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-dur" className="text-xs font-semibold">
                Duration (min)
              </Label>
              <Input
                id="event-dur"
                type="number"
                min="0"
                placeholder="e.g. 90"
                value={durationMinutes ?? ""}
                onChange={(e) =>
                  setDurationMinutes(
                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                  )
                }
                className="text-xs h-9"
              />
            </div>
          </div>

          {/* Community & Course Selectors (Only required for creation) */}
          {!isEditing && (
            <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
              <div className="font-semibold text-xs text-foreground">
                Community & Course Assignment
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Enrolled Community *
                  </Label>
                  <Select
                    value={communitySlug}
                    onValueChange={(val: string | null) => {
                      if (val) {
                        setCommunitySlug(val);
                        setCourseId(undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background">
                      <SelectValue
                        placeholder={
                          communities.length === 0
                            ? "No enrolled communities"
                            : "Select community"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((c) => (
                        <SelectItem key={c.id} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Study Year
                  </Label>
                  <Select
                    value={formStudyYear}
                    onValueChange={(val: string | null) => {
                      if (val) {
                        setFormStudyYear(val);
                        setCourseId(undefined);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDY_YEARS.map((y, idx) => (
                        <SelectItem key={y} value={y}>
                          Year {idx + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Course *
                  </Label>
                  <Select
                    value={effectiveCourseId ? String(effectiveCourseId) : ""}
                    onValueChange={(val: string | null) => {
                      if (val) setCourseId(Number(val));
                    }}
                    disabled={availableCourses.length === 0}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background">
                      <SelectValue
                        placeholder={
                          availableCourses.length === 0
                            ? "No courses found"
                            : "Select course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((c) => (
                        <SelectItem
                          key={c.course.id}
                          value={String(c.course.id)}
                        >
                          {c.course.abbreviation
                            ? `[${c.course.abbreviation}] ${c.course.name}`
                            : c.course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="event-desc" className="text-xs font-semibold">
              Description / Syllabus Notes (Optional)
            </Label>
            <Textarea
              id="event-desc"
              rows={3}
              placeholder="Add relevant instructions, exam topics, requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          {/* Modal Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              {isSubmitting
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
