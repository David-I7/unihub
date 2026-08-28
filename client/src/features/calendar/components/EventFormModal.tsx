import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  GraduationCap,
  Info,
  Users,
} from "lucide-react";
import { useUserCommunities } from "@/features/users";
import { useCommunityStudyYears } from "@/features/communities";
import {
  StudyYearNameMap,
  useStudyYearCourses,
  type StudyYearName,
} from "@/features/studyYears";
import { useCreateEvent, useUpdateEvent } from "../api/events";
import { useCalendarStore } from "../store/useCalendarStore";
import type {
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

export function EventFormModal() {
  const isOpen = useCalendarStore((s) => s.isFormModalOpen);
  const onClose = useCalendarStore((s) => s.closeFormModal);
  const defaultDate = useCalendarStore((s) => s.formDefaultDate);
  const editingEvent = useCalendarStore((s) => s.editingEvent);
  const defaultCommunitySlug = useCalendarStore((s) => s.communitySlug);
  const defaultStudyYear = useCalendarStore((s) => s.studyYear);
  const defaultCourseSlug = useCalendarStore((s) => s.courseSlug);

  const isEditing = Boolean(editingEvent);

  // 1. Fetch user's enrolled communities
  const { data: userCommunitiesData, isLoading: isLoadingCommunities } =
    useUserCommunities();
  const communities = userCommunitiesData?.communities ?? [];
  const hasCommunities = communities.length > 0;

  // Form states
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

  // Creation cascade states
  const [formCommunitySlug, setFormCommunitySlug] = useState<string | null>(
    null,
  );
  const [formStudyYear, setFormStudyYear] = useState<string | null>(null);
  const [formCourseId, setFormCourseId] = useState<number | undefined>(
    undefined,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // 2. Fetch study years for currently selected community
  const { data: communityStudyYears, isLoading: isLoadingStudyYears } =
    useCommunityStudyYears(formCommunitySlug ?? "");

  // 3. Fetch courses for selected community & study year
  const { data: studyYearCourses, isLoading: isLoadingCourses } =
    useStudyYearCourses(formCommunitySlug ?? "", formStudyYear ?? "");

  // Initialize or reset form state on open / change
  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);

    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription("");
      setType(editingEvent.type);
      setStartTime(toDatetimeLocal(editingEvent.startTime));
      setEndTime(
        editingEvent.endTime ? toDatetimeLocal(editingEvent.endTime) : "",
      );
      setDurationMinutes(editingEvent.durationMinutes);
      setLocation(editingEvent.location);
      setLocationDetails("");
      setFormCommunitySlug(editingEvent.communitySlug);
      setFormCourseId(undefined);
    } else {
      setTitle("");
      setDescription("");
      setType("EXAM");
      setStartTime(toDatetimeLocal(undefined, defaultDate));
      setEndTime("");
      setDurationMinutes(undefined);
      setLocation("IN_PERSON");
      setLocationDetails("");

      // Pick initial community: preferred default, or first available enrolled community
      const initialCommunity =
        defaultCommunitySlug &&
        communities.some((c) => c.slug === defaultCommunitySlug)
          ? defaultCommunitySlug
          : communities[0]?.slug ?? null;

      setFormCommunitySlug(initialCommunity);
      setFormStudyYear(defaultStudyYear ?? null);
      setFormCourseId(undefined);
    }
  }, [
    isOpen,
    editingEvent,
    defaultDate,
    defaultCommunitySlug,
    defaultStudyYear,
    communities,
  ]);

  // When study years load for the selected community, ensure a valid study year is selected
  useEffect(() => {
    if (isEditing || !communityStudyYears) return;

    if (communityStudyYears.length === 0) {
      setFormStudyYear(null);
      setFormCourseId(undefined);
      return;
    }

    // Keep current selection if valid in new study years list
    const currentIsValid = communityStudyYears.some(
      (y) => StudyYearNameMap[y.studyYearName] === formStudyYear,
    );

    if (!currentIsValid) {
      const firstYearMapped =
        StudyYearNameMap[communityStudyYears[0].studyYearName];
      setFormStudyYear(firstYearMapped ?? null);
      setFormCourseId(undefined);
    }
  }, [communityStudyYears, formStudyYear, isEditing]);

  // When courses load, optionally auto-select or pick based on defaultCourseSlug
  useEffect(() => {
    if (isEditing || !studyYearCourses) return;

    if (studyYearCourses.length === 0) {
      setFormCourseId(undefined);
      return;
    }

    if (
      defaultCourseSlug &&
      studyYearCourses.some((c) => c.slug === defaultCourseSlug)
    ) {
      const matched = studyYearCourses.find((c) => c.slug === defaultCourseSlug);
      if (matched) {
        setFormCourseId(matched.id);
        return;
      }
    }

    // If current selected course isn't in list, select the first course
    const currentCourseExists = studyYearCourses.some(
      (c) => c.id === formCourseId,
    );
    if (!currentCourseExists) {
      setFormCourseId(studyYearCourses[0].id);
    }
  }, [studyYearCourses, formCourseId, defaultCourseSlug, isEditing]);

  // Selected study year display label
  const activeStudyYearName = useMemo(() => {
    if (!communityStudyYears || !formStudyYear) return null;
    const found = communityStudyYears.find(
      (y) => StudyYearNameMap[y.studyYearName] === formStudyYear,
    );
    return found?.studyYearName ?? null;
  }, [communityStudyYears, formStudyYear]);

  // Mutations
  const { mutate: createEventMutate, isPending: isCreating } = useCreateEvent();
  const { mutate: updateEventMutate, isPending: isUpdating } = useUpdateEvent();
  const isSubmitting = isCreating || isUpdating;

  // Validation rules evaluation
  const hasStudyYears = Boolean(
    communityStudyYears && communityStudyYears.length > 0,
  );
  const hasCourses = Boolean(studyYearCourses && studyYearCourses.length > 0);
  const canCreateInCommunity = hasCommunities && hasStudyYears && hasCourses;

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
      if (!hasCommunities || !formCommunitySlug) {
        setValidationError(
          "You must be a member of a community to create calendar events",
        );
        return;
      }
      if (!formCourseId) {
        setValidationError(
          "Please select a course. Events must be linked to a course",
        );
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
        communitySlug: formCommunitySlug,
        courseId: formCourseId,
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

        {/* Global form validation message */}
        {validationError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{validationError}</span>
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
              placeholder="e.g. Midterm Examination, Assignment 1 Submission, Lab Tutorial"
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
                placeholder="e.g. Room 301, Amphitheater B, or Meeting URL"
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

          {/* Read-Only Context when Editing */}
          {isEditing && editingEvent && (
            <div className="rounded-xl border bg-muted/40 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Users className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Community:</span>
                <span className="font-semibold text-foreground">
                  {editingEvent.communitySlug}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Course:</span>
                {editingEvent.courseAbbreviation && (
                  <span className="font-mono text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded">
                    [{editingEvent.courseAbbreviation}]
                  </span>
                )}
                <span className="font-semibold text-foreground">
                  {editingEvent.courseName}
                </span>
              </div>
            </div>
          )}

          {/* Cascading Community, Study Year, and Course Selectors (Create Mode) */}
          {!isEditing && (
            <div className="rounded-xl border bg-muted/30 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                  <GraduationCap className="size-3.5 text-primary" />
                  Course & Community Selection *
                </span>
                {formCommunitySlug && (
                  <span className="text-[11px] text-muted-foreground">
                    Required for scheduling
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Community Dropdown */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Enrolled Community *
                  </Label>
                  <Select
                    value={formCommunitySlug}
                    onValueChange={(val: string | null) => {
                      if (!val || val === "NO_COMMUNITIES") return;
                      setFormCommunitySlug(val);
                      setFormStudyYear(null);
                      setFormCourseId(undefined);
                    }}
                    disabled={!hasCommunities}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background">
                      <SelectValue
                        placeholder={
                          isLoadingCommunities
                            ? "Loading..."
                            : !hasCommunities
                              ? "No communities"
                              : "Select community"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!hasCommunities ? (
                        <SelectItem value="NO_COMMUNITIES" disabled>
                          No enrolled communities
                        </SelectItem>
                      ) : (
                        communities.map((c) => (
                          <SelectItem key={c.id} value={c.slug}>
                            {c.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Study Year Dropdown */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Study Year *
                  </Label>
                  <Select
                    value={activeStudyYearName ?? undefined}
                    onValueChange={(val: string | null) => {
                      if (!val || val === "NO_YEARS") return;
                      const next = StudyYearNameMap[val as StudyYearName];
                      setFormStudyYear(next ?? null);
                      setFormCourseId(undefined);
                    }}
                    disabled={!formCommunitySlug || !hasStudyYears}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background">
                      <SelectValue
                        placeholder={
                          isLoadingStudyYears
                            ? "Loading years..."
                            : !formCommunitySlug
                              ? "Pick community first"
                              : !hasStudyYears
                                ? "No study years"
                                : "Select year"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!hasStudyYears ? (
                        <SelectItem value="NO_YEARS" disabled>
                          No study years found
                        </SelectItem>
                      ) : (
                        communityStudyYears?.map((y) => (
                          <SelectItem key={y.id} value={y.studyYearName}>
                            {y.studyYearName}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 3. Course Dropdown */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">
                    Course *
                  </Label>
                  <Select
                    value={formCourseId ? String(formCourseId) : undefined}
                    onValueChange={(val: string | null) => {
                      if (!val || val === "NO_COURSES") return;
                      setFormCourseId(Number(val));
                    }}
                    disabled={!formStudyYear || !hasCourses}
                  >
                    <SelectTrigger className="w-full h-8 text-xs bg-background">
                      <SelectValue
                        placeholder={
                          isLoadingCourses
                            ? "Loading courses..."
                            : !formStudyYear
                              ? "Pick year first"
                              : !hasCourses
                                ? "No courses"
                                : "Select course"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {!hasCourses ? (
                        <SelectItem value="NO_COURSES" disabled>
                          No courses available
                        </SelectItem>
                      ) : (
                        studyYearCourses?.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.abbreviation ? `[${c.abbreviation}] ` : ""}
                            {c.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Informative notices for missing study years / courses */}
              {formCommunitySlug &&
                !isLoadingStudyYears &&
                !hasStudyYears && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Info className="size-3.5 text-amber-500 shrink-0" />
                    <span>
                      The selected community has no study years configured yet.
                    </span>
                  </div>
                )}

              {formCommunitySlug &&
                formStudyYear &&
                !isLoadingCourses &&
                !hasCourses && (
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                    <Info className="size-3.5 text-amber-500 shrink-0" />
                    <span>
                      No courses found in this study year. Events must be linked to
                      a course.
                    </span>
                  </div>
                )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="event-desc" className="text-xs font-semibold">
              Description / Notes (Optional)
            </Label>
            <Textarea
              id="event-desc"
              rows={3}
              placeholder="Add relevant instructions, exam topics, room directions, or syllabus details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          {/* Modal Footer */}
          <DialogFooter className="gap-2 pt-2">
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
              disabled={isSubmitting || (!isEditing && !canCreateInCommunity)}
              className="h-8 text-xs font-semibold cursor-pointer"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving Changes..."
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
