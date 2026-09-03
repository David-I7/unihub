import { useEffect, useMemo } from "react";
import { isAxiosError } from "axios";
import { AlertCircle, Info } from "lucide-react";
import { useUserCommunities } from "@/features/users";
import { useCommunityStudyYears } from "@/features/communities";
import {
  StudyYearNameMap,
  useStudyYearCourses,
  type StudyYearName,
} from "@/features/studyYears";
import { useForm } from "@/hooks/useForm";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useCreateEvent, useUpdateEvent } from "../api/events";
import { useCalendarStore } from "../store/useCalendarStore";
import { CALENDAR_FILTER_SCHEMA } from "../schemas/calendarFilterSchema";
import { eventFormSchema, type EventFormData } from "../schemas/eventSchemas";
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
import { toDatetimeLocal } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import {
  EVENT_TYPE_OPTIONS,
  EVENT_LOCATION_OPTIONS,
} from "../utils/eventUtils";
import { getFormErrors } from "@/api/types";
import { toast } from "sonner";

export function EventFormModal() {
  const isOpen = useCalendarStore((s) => s.isFormModalOpen);
  const onClose = useCalendarStore((s) => s.closeFormModal);
  const defaultDate = useCalendarStore((s) => s.formDefaultDate);
  const editingEvent = useCalendarStore((s) => s.editingEvent);

  const { filters } = useUrlFilters(CALENDAR_FILTER_SCHEMA);
  const defaultCommunitySlug = filters.community || null;
  const defaultStudyYear = filters.studyYear || null;
  const defaultCourseSlug = filters.course || null;

  const isEditing = Boolean(editingEvent);

  // 1. Fetch user's enrolled communities
  const { data: userCommunitiesData, isLoading: isLoadingCommunities } =
    useUserCommunities();
  const communities = userCommunitiesData?.content ?? [];
  const hasCommunities = communities.length > 0;

  // Mutations
  const { mutateAsync: createEventMutateAsync, isPending: isCreating } =
    useCreateEvent();
  const { mutateAsync: updateEventMutateAsync, isPending: isUpdating } =
    useUpdateEvent();

  // 2. Form state with Zod validation
  const form = useForm<EventFormData>({
    initialValues: {
      title: "",
      description: "",
      type: "EXAM",
      startTime: toDatetimeLocal(undefined, defaultDate),
      durationHours: "",
      location: "IN_PERSON",
      locationDetails: "",
      communitySlug: defaultCommunitySlug ?? "",
      studyYear: defaultStudyYear ?? "",
      courseId: "",
      isEditing,
    },
    schema: eventFormSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      const startIso = new Date(values.startTime).toISOString();

      const durationNum =
        typeof values.durationHours === "number" && values.durationHours > 0
          ? values.durationHours
          : undefined;

      if (isEditing && editingEvent) {
        const dirty = form.dirtyFields;
        const payload: UpdateEventPayload = {};

        if (dirty.title) payload.title = values.title.trim();
        if (dirty.description)
          payload.description = values.description?.trim() || "";
        if (dirty.type) payload.type = values.type;
        if (dirty.durationHours) payload.durationHours = durationNum;
        if (dirty.location) payload.location = values.location;
        if (dirty.locationDetails)
          payload.locationDetails = values.locationDetails?.trim() || "";

        try {
          await updateEventMutateAsync({ id: editingEvent.id, payload });
          toast.success("Event updated successfully");
          onClose();
        } catch (err) {
          setFormErrors(err, "Failed to update event");
          toast.error("Failed to update event");
        }
      } else {
        const payload: CreateEventPayload = {
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          type: values.type,
          startTime: startIso,
          durationHours: durationNum,
          location: values.location,
          locationDetails: values.locationDetails?.trim() || undefined,
          communitySlug: values.communitySlug ?? "",
          courseId: Number(values.courseId),
        };

        try {
          await createEventMutateAsync(payload);
          toast.success("Event created successfully");
          onClose();
        } catch (err) {
          toast.error("Failed to create event");
          setFormErrors(err, "Failed to create event");
        }
      }
    },
  });

  const selectedCommunitySlug = form.values.communitySlug || null;
  const selectedStudyYear = form.values.studyYear || null;

  // 3. Fetch study years for selected community
  const { data: communityStudyYears, isLoading: isLoadingStudyYears } =
    useCommunityStudyYears(selectedCommunitySlug ?? "");

  // 4. Fetch courses for selected community & study year
  const { data: studyYearCourses, isLoading: isLoadingCourses } =
    useStudyYearCourses(selectedCommunitySlug ?? "", selectedStudyYear ?? "");

  // Reset form on open or editingEvent changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingEvent) {
      form.reset({
        title: editingEvent.title,
        description: editingEvent.description ?? "",
        type: editingEvent.type,
        startTime: toDatetimeLocal(editingEvent.startTime),
        durationHours: editingEvent.durationHours ?? "",
        location: editingEvent.location,
        locationDetails: editingEvent.locationDetails ?? "",
        communitySlug: editingEvent.communitySlug,
        studyYear: editingEvent.studyYear ?? "",
        courseId: "",
        isEditing: true,
      });
    } else {
      const initialCommunity =
        defaultCommunitySlug &&
        communities.some((c) => c.slug === defaultCommunitySlug)
          ? defaultCommunitySlug
          : (communities[0]?.slug ?? "");

      form.reset({
        title: "",
        description: "",
        type: "EXAM",
        startTime: toDatetimeLocal(undefined, defaultDate),
        durationHours: "",
        location: "IN_PERSON",
        locationDetails: "",
        communitySlug: initialCommunity,
        studyYear: defaultStudyYear ?? "",
        courseId: "",
        isEditing: false,
      });
    }
  }, [
    isOpen,
    editingEvent,
    defaultDate,
    defaultCommunitySlug,
    defaultStudyYear,
    communities,
  ]);

  const setFormErrors = (err: unknown, defaultErrorMessage: string) => {
    const { server, validation } = getFormErrors(err, defaultErrorMessage);

    if (server) {
      form.setServerError(server);
    }

    if (validation) {
      const errors: typeof form.errors = {} as typeof form.errors;
      for (const error of validation) {
        if (error.type === "FIELD") {
          errors[error.field! as keyof EventFormData] = error.message;
        }
      }
      form.setErrors((prev) => ({ ...prev, ...errors }));
    }
  };

  // When study years load for the selected community, ensure a valid study year is selected
  useEffect(() => {
    if (isEditing || !communityStudyYears) return;

    if (communityStudyYears.length === 0) {
      form.setValue("studyYear", "");
      form.setValue("courseId", "");
      return;
    }

    const currentYear = form.values.studyYear;
    const currentIsValid = communityStudyYears.some(
      (y) => StudyYearNameMap[y.studyYearName] === currentYear,
    );

    if (!currentIsValid) {
      const firstYearMapped =
        StudyYearNameMap[communityStudyYears[0].studyYearName];
      form.setValue("studyYear", firstYearMapped ?? "");
      form.setValue("courseId", "");
    }
  }, [communityStudyYears, form.values.studyYear, isEditing]);

  // When courses load, auto-select matching or first course
  useEffect(() => {
    if (isEditing || !studyYearCourses) return;

    if (studyYearCourses.length === 0) {
      form.setValue("courseId", "");
      return;
    }

    if (
      defaultCourseSlug &&
      studyYearCourses.some((c) => c.slug === defaultCourseSlug)
    ) {
      const matched = studyYearCourses.find(
        (c) => c.slug === defaultCourseSlug,
      );
      if (matched) {
        form.setValue("courseId", matched.id);
        return;
      }
    }

    const currentCourseExists = studyYearCourses.some(
      (c) => c.id === form.values.courseId,
    );
    if (!currentCourseExists) {
      form.setValue("courseId", studyYearCourses[0].id);
    }
  }, [studyYearCourses, form.values.courseId, defaultCourseSlug, isEditing]);

  const selectedCommunity = useMemo(() => {
    if (!selectedCommunitySlug) return null;
    return communities.find((c) => c.slug === selectedCommunitySlug) ?? null;
  }, [communities, selectedCommunitySlug]);

  // Selected study year display label
  const activeStudyYearName = useMemo(() => {
    if (!communityStudyYears || !selectedStudyYear) return null;
    const found = communityStudyYears.find(
      (y) => StudyYearNameMap[y.studyYearName] === selectedStudyYear,
    );
    return found?.studyYearName ?? null;
  }, [communityStudyYears, selectedStudyYear]);

  // Selected course display object
  const selectedCourse = useMemo(() => {
    if (!studyYearCourses || !form.values.courseId) return null;
    return studyYearCourses.find((c) => c.id === form.values.courseId) ?? null;
  }, [studyYearCourses, form.values.courseId]);

  const hasStudyYears = Boolean(
    communityStudyYears && communityStudyYears.length > 0,
  );
  const hasCourses = Boolean(studyYearCourses && studyYearCourses.length > 0);
  const canCreateInCommunity = hasCommunities && hasStudyYears && hasCourses;
  const isSubmitting = isCreating || isUpdating || form.isSubmitting;

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

        {/* Global server error alert banner */}
        {form.serverError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{form.serverError}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit} className="space-y-4 text-xs">
          {/* Cascading Community, Study Year, and Course Selectors */}
          <div className="rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                Course & Community Selection {!isEditing && "*"}
              </span>
              {isEditing ? (
                <span className="text-[11px] text-muted-foreground italic">
                  Course context is locked
                </span>
              ) : selectedCommunitySlug ? (
                <span className="text-[11px] text-muted-foreground">
                  Required for scheduling
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. Community Dropdown */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">
                  Enrolled Community *
                </Label>
                <Select
                  value={selectedCommunitySlug || null}
                  onValueChange={(val: string | null) => {
                    if (!val || val === "NO_COMMUNITIES") return;
                    form.setValue("communitySlug", val);
                    form.setValue("studyYear", "");
                    form.setValue("courseId", "");
                  }}
                  disabled={isEditing || !hasCommunities}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-8 text-xs bg-background",
                      isEditing && "opacity-80 bg-muted/50 cursor-not-allowed",
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingCommunities
                          ? "Loading..."
                          : !hasCommunities
                            ? "No communities"
                            : "Select community"
                      }
                    >
                      {isEditing
                        ? editingEvent?.communityName ||
                          editingEvent?.communitySlug ||
                          selectedCommunity?.name
                        : selectedCommunity?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {!hasCommunities ? (
                      <SelectItem value="NO_COMMUNITIES" disabled>
                        No enrolled communities
                      </SelectItem>
                    ) : (
                      communities.map((c) => (
                        <SelectItem key={c.id} value={c.slug}>
                          <span className="truncate">{c.name}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!isEditing && form.errors.communitySlug && (
                  <p className="text-[11px] text-destructive">
                    {form.errors.communitySlug}
                  </p>
                )}
              </div>

              {/* 2. Study Year Dropdown */}
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">
                  Study Year *
                </Label>
                <Select
                  value={activeStudyYearName ?? null}
                  onValueChange={(val: string | null) => {
                    if (!val || val === "NO_YEARS") return;
                    const next = StudyYearNameMap[val as StudyYearName];
                    form.setValue("studyYear", next ?? "");
                    form.setValue("courseId", "");
                  }}
                  disabled={
                    isEditing || !selectedCommunitySlug || !hasStudyYears
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-8 text-xs bg-background",
                      isEditing && "opacity-80 bg-muted/50 cursor-not-allowed",
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingStudyYears
                          ? "Loading years..."
                          : !selectedCommunitySlug
                            ? "Pick community first"
                            : !hasStudyYears
                              ? "No study years"
                              : "Select year"
                      }
                    >
                      {isEditing
                        ? editingEvent?.studyYear || activeStudyYearName
                        : activeStudyYearName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {!hasStudyYears ? (
                      <SelectItem value="NO_YEARS" disabled>
                        No study years found
                      </SelectItem>
                    ) : (
                      communityStudyYears?.map((y) => (
                        <SelectItem key={y.id} value={y.studyYearName}>
                          <span className="truncate">{y.studyYearName}</span>
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
                  value={
                    form.values.courseId ? String(form.values.courseId) : null
                  }
                  onValueChange={(val: string | null) => {
                    if (!val || val === "NO_COURSES") return;
                    form.setValue("courseId", Number(val));
                  }}
                  disabled={isEditing || !selectedStudyYear || !hasCourses}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full h-8 text-xs bg-background",
                      isEditing && "opacity-80 bg-muted/50 cursor-not-allowed",
                    )}
                  >
                    <SelectValue
                      placeholder={
                        isLoadingCourses
                          ? "Loading courses..."
                          : !selectedStudyYear
                            ? "Pick year first"
                            : !hasCourses
                              ? "No courses"
                              : "Select course"
                      }
                    >
                      {isEditing
                        ? editingEvent?.courseName || selectedCourse?.name
                        : selectedCourse?.name || undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {!hasCourses ? (
                      <SelectItem value="NO_COURSES" disabled>
                        No courses available
                      </SelectItem>
                    ) : (
                      studyYearCourses?.map((c) => (
                        <SelectItem
                          className="px-2 py-1"
                          key={c.id}
                          value={String(c.id)}
                        >
                          <span className="truncate">{c.name}</span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!isEditing && form.errors.courseId && (
                  <p className="text-[11px] text-destructive">
                    {form.errors.courseId}
                  </p>
                )}
              </div>
            </div>

            {/* Informative notices for missing study years / courses (Create Mode only) */}
            {!isEditing &&
              selectedCommunitySlug &&
              !isLoadingStudyYears &&
              !hasStudyYears && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <Info className="size-3.5 text-amber-500 shrink-0" />
                  <span>
                    The selected community has no study years configured yet.
                  </span>
                </div>
              )}

            {!isEditing &&
              selectedCommunitySlug &&
              selectedStudyYear &&
              !isLoadingCourses &&
              !hasCourses && (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
                  <Info className="size-3.5 text-amber-500 shrink-0" />
                  <span>
                    No courses found in this study year. Events must be linked
                    to a course.
                  </span>
                </div>
              )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="event-title" className="text-xs font-semibold">
              Event Title *
            </Label>
            <Input
              id="event-title"
              name="title"
              placeholder="e.g. Midterm Examination, Assignment 1 Submission, Lab Tutorial"
              value={form.values.title}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="text-xs h-9"
              aria-invalid={form.isInvalid("title")}
            />
            {form.errors.title && (
              <p className="text-[11px] text-destructive">
                {form.errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="event-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="event-desc"
              name="description"
              rows={3}
              placeholder="Add relevant instructions, exam topics, room directions, or syllabus details..."
              value={form.values.description ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="text-xs resize-none"
            />
            {form.errors.description && (
              <p className="text-[11px] text-destructive">
                {form.errors.description}
              </p>
            )}
          </div>

          {/* Event Type & Location Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Event Type *</Label>
              <Select
                value={form.values.type}
                onValueChange={(val: string | null) => {
                  if (val) form.setValue("type", val as EventType);
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background">
                  <SelectValue placeholder="Select event type">
                    {(() => {
                      const opt = EVENT_TYPE_OPTIONS.find(
                        (t) => t.value === form.values.type,
                      );
                      if (!opt) return null;
                      const Icon = opt.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-3.5", opt.colorClass)} />
                          <span>{opt.label}</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2 text-xs">
                          <Icon className={cn("size-3.5", t.colorClass)} />
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {form.errors.type && (
                <p className="text-[11px] text-destructive">
                  {form.errors.type}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Location Format *</Label>
              <Select
                value={form.values.location}
                onValueChange={(val: string | null) => {
                  if (val) form.setValue("location", val as EventLocation);
                }}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-background">
                  <SelectValue placeholder="Select location format">
                    {(() => {
                      const opt = EVENT_LOCATION_OPTIONS.find(
                        (l) => l.value === form.values.location,
                      );
                      if (!opt) return null;
                      const Icon = opt.icon;
                      return (
                        <div className="flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span>{opt.label}</span>
                        </div>
                      );
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {EVENT_LOCATION_OPTIONS.map((l) => {
                    const Icon = l.icon;
                    return (
                      <SelectItem key={l.value} value={l.value}>
                        <div className="flex items-center gap-2 text-xs">
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span>{l.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {form.errors.location && (
                <p className="text-[11px] text-destructive">
                  {form.errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Start Date Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="event-start" className="text-xs font-semibold">
                Start Date & Time *
              </Label>
              <DateTimePicker
                id="event-start"
                value={form.values.startTime}
                onChange={(val) => form.setValue("startTime", val)}
                placeholder="Select start date & time"
                disabled={isEditing}
              />
              {isEditing ? (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Start time cannot be changed. Delete and reschedule if the
                  event date or time needs to change.
                </p>
              ) : form.errors.startTime ? (
                <p className="text-[11px] text-destructive">
                  {form.errors.startTime}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-dur" className="text-xs font-semibold">
                Duration (Hours)
              </Label>
              <Input
                id="event-dur"
                name="durationHours"
                type="number"
                placeholder="e.g. 1.5 (optional)"
                value={form.values.durationHours ?? ""}
                onChange={(e) =>
                  form.setValue(
                    "durationHours",
                    e.target.value ? parseFloat(e.target.value) : "",
                  )
                }
                onBlur={form.handleBlur}
                className="text-xs h-9"
              />
              {form.errors.durationHours && (
                <p className="text-[11px] text-destructive">
                  {form.errors.durationHours}
                </p>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="space-y-1.5">
            <Label htmlFor="event-loc" className="text-xs font-semibold">
              Location Details / Meeting Link (Optional)
            </Label>
            <Input
              id="event-loc"
              name="locationDetails"
              placeholder="e.g. Room 301, Amphitheater B, or Meeting URL"
              value={form.values.locationDetails ?? ""}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="text-xs h-9"
            />
            {form.errors.locationDetails && (
              <p className="text-[11px] text-destructive">
                {form.errors.locationDetails}
              </p>
            )}
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
              disabled={
                isSubmitting ||
                (!isEditing && !canCreateInCommunity) ||
                (isEditing && !form.isDirty)
              }
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
