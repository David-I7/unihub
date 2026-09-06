import { useState, useMemo, useEffect } from "react";
import {
  Check,
  Copy,
  FileText,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  BookOpen,
} from "@/components/ui/icons";
import { toast } from "sonner";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useUserCommunities } from "@/features/users";
import { useCommunityStudyYears } from "@/features/communities";
import {
  useStudyYearCourses,
  formatStudyYearName,
  studyYearNameToSlug,
} from "@/features/studyYears";
import { useCalendarStore } from "../store/useCalendarStore";
import { useBatchUpsertEvents } from "../api/events";
import { CALENDAR_FILTER_SCHEMA } from "../schemas/calendarFilterSchema";
import {
  batchEventsArraySchema,
  type BatchEventItemParsed,
} from "../schemas/eventSchemas";
import { generateSchedulePrompt } from "../utils/schedulePromptGenerator";
import { formatPostDate } from "@/lib/dateUtils";
import {
  getEventCategoryConfig,
  formatEventLocation,
} from "../utils/eventUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

export function BatchImportEventsModal() {
  const isOpen = useCalendarStore((s) => s.isBatchModalOpen);
  const onClose = useCalendarStore((s) => s.closeBatchModal);

  const { filters } = useUrlFilters(CALENDAR_FILTER_SCHEMA);
  const communitySlug = filters.community || "";

  // Step state
  const [step, setStep] = useState<Step>(1);
  const [selectedStudyYear, setSelectedStudyYear] = useState<string>("");
  const [pastedJson, setPastedJson] = useState<string>("");
  const [parsedEvents, setParsedEvents] = useState<BatchEventItemParsed[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Fetch community details
  const { data: userCommunitiesData } = useUserCommunities(
    {},
    { enabled: isOpen && Boolean(communitySlug) },
  );
  const activeCommunity = useMemo(() => {
    return userCommunitiesData?.content?.find((c) => c.slug === communitySlug);
  }, [userCommunitiesData, communitySlug]);

  // Fetch study years for community
  const { data: studyYears } = useCommunityStudyYears(communitySlug);

  // Default study year to URL filter or first available
  useEffect(() => {
    if (!isOpen) return;
    if (filters.studyYear) {
      setSelectedStudyYear(filters.studyYear);
    } else if (studyYears && studyYears.length > 0) {
      setSelectedStudyYear(studyYears[0].studyYearName);
    }
  }, [isOpen, filters.studyYear, studyYears]);

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setPastedJson("");
      setParsedEvents([]);
      setValidationError(null);
      setIsCopied(false);
    }
  }, [isOpen]);

  // Fetch courses for the selected study year
  const { data: coursesData, isLoading: isLoadingCourses } =
    useStudyYearCourses(
      communitySlug,
      selectedStudyYear ? studyYearNameToSlug(selectedStudyYear) : "",
    );

  const courses = useMemo(() => {
    return (coursesData ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      abbreviation: c.abbreviation,
    }));
  }, [coursesData]);

  // Course map for preview lookups
  const courseMap = useMemo(() => {
    const map = new Map<number, { name: string; abbreviation?: string }>();
    courses.forEach((c) =>
      map.set(c.id, { name: c.name, abbreviation: c.abbreviation }),
    );
    return map;
  }, [courses]);

  // Generate the customized prompt
  const generatedPrompt = useMemo(() => {
    const displayName = formatStudyYearName(selectedStudyYear);
    const commName = activeCommunity?.name || communitySlug;
    return generateSchedulePrompt({
      communityName: commName,
      studyYearDisplayName: displayName,
      courses,
    });
  }, [selectedStudyYear, activeCommunity, communitySlug, courses]);

  // Copy prompt handler
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Failed to copy prompt to clipboard");
    }
  };

  // Validate pasted JSON
  const handleValidateJson = () => {
    setValidationError(null);
    const cleaned = pastedJson
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!cleaned) {
      setValidationError("Please paste the JSON generated by the LLM.");
      return;
    }

    let rawJson: unknown;
    try {
      rawJson = JSON.parse(cleaned);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid JSON syntax";
      setValidationError(`JSON parsing error: ${msg}`);
      return;
    }

    // Support either direct array or { events: [...] }
    const itemsToValidate = Array.isArray(rawJson)
      ? rawJson
      : typeof rawJson === "object" && rawJson !== null && "events" in rawJson
        ? (rawJson as { events: unknown }).events
        : null;

    if (!Array.isArray(itemsToValidate)) {
      setValidationError(
        "Expected a JSON array of events or an object with an 'events' array.",
      );
      return;
    }

    const parseResult = batchEventsArraySchema.safeParse(itemsToValidate);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      const path = firstIssue.path.join(".");
      setValidationError(
        `Validation error at ${path || "root"}: ${firstIssue.message}`,
      );
      return;
    }

    setParsedEvents(parseResult.data);
    setStep(3);
  };

  // Batch mutation
  const { mutateAsync: batchUpsert, isPending: isSubmitting } =
    useBatchUpsertEvents();

  // Check if any event is in the past
  const pastEventsCount = useMemo(() => {
    const now = Date.now();
    return parsedEvents.filter((ev) => new Date(ev.startTime).getTime() < now)
      .length;
  }, [parsedEvents]);

  // Submit batch import
  const handleConfirmImport = async () => {
    if (!communitySlug) {
      toast.error("No community selected");
      return;
    }

    if (pastEventsCount > 0) {
      toast.error("Cannot import events scheduled in the past");
      return;
    }

    try {
      const res = await batchUpsert({
        communitySlug,
        events: parsedEvents.map((e) => ({
          courseId: e.courseId,
          title: e.title,
          description: e.description ?? undefined,
          type: e.type,
          startTime: e.startTime,
          durationHours: e.durationHours ?? undefined,
          location: e.location,
          locationDetails: e.locationDetails ?? undefined,
        })),
      });

      toast.success(
        `Batch processed: ${res.createdCount} created, ${res.updatedCount} updated`,
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Batch import failed";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden"
        aria-describedby="batch-import-description"
      >
        {/* Header */}
        <DialogHeader className="border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                Batch Import Events
              </DialogTitle>
              <DialogDescription
                id="batch-import-description"
                className="text-xs text-muted-foreground mt-0.5"
              >
                Import lecture schedules or exam dates extracted from documents
                via an LLM.
              </DialogDescription>
            </div>
          </div>

          {/* Stepper Tabs */}
          <div className="flex items-center gap-2 mt-4 text-xs font-semibold">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
                step === 1
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent",
              )}
            >
              <span>1</span>
              <span>Generate Prompt</span>
            </div>
            <div className="w-4 h-px bg-border shrink-0" />
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
                step === 2
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent",
              )}
            >
              <span>2</span>
              <span>Paste JSON</span>
            </div>
            <div className="w-4 h-px bg-border shrink-0" />
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors",
                step === 3
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent",
              )}
            >
              <span>3</span>
              <span>Preview & Confirm</span>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* STEP 1: Select Cohort & Copy Prompt */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-foreground">
                      Target Study Year
                    </Label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Select which cohort this schedule or exam timetable
                      applies to.
                    </p>
                  </div>
                  <Select
                    value={selectedStudyYear}
                    onValueChange={(val) => setSelectedStudyYear(val ?? "")}
                  >
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {studyYears?.map((sy) => (
                        <SelectItem key={sy.id} value={sy.studyYearName}>
                          {formatStudyYearName(sy.studyYearName)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                  <span>
                    Community:{" "}
                    <strong className="text-foreground">
                      {activeCommunity?.name || communitySlug}
                    </strong>
                  </span>
                  <span>
                    Courses mapped:{" "}
                    {isLoadingCourses ? (
                      <span className="inline-flex items-center gap-1">
                        <Spinner className="size-3" /> loading...
                      </span>
                    ) : (
                      <strong className="text-foreground">
                        {courses.length} courses
                      </strong>
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5" />
                    Generated Prompt for LLM
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="gap-1.5 h-8 text-xs font-medium cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative rounded-xl border bg-muted/30 p-3 max-h-[260px] overflow-y-auto font-mono text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {generatedPrompt}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Give this prompt together with your PDF or document text to
                  any LLM (e.g. Gemini, ChatGPT, Claude) to extract the
                  schedule.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Paste LLM JSON */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Paste LLM Output (JSON)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Accepts raw JSON array [ ... ]
                  </span>
                </div>
                <Textarea
                  value={pastedJson}
                  onChange={(e) => {
                    setPastedJson(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder='[\n  {\n    "courseId": 1,\n    "title": "Curs: Geometrie și algebră liniară",\n    "type": "LECTURE",\n    "startTime": "2026-09-08T10:00:00+03:00",\n    "durationHours": 5,\n    "location": "ONLINE",\n    "locationDetails": null\n  }\n]'
                  className="font-mono text-xs min-h-[280px] leading-relaxed resize-y bg-background"
                />
              </div>

              {validationError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <div className="flex-1 font-medium">{validationError}</div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Preview & Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-muted/40 border text-xs">
                <div className="flex items-center gap-3">
                  <span>
                    Total:{" "}
                    <strong className="text-foreground">
                      {parsedEvents.length}
                    </strong>{" "}
                    events
                  </span>
                  <span>
                    Lectures:{" "}
                    <strong className="text-blue-600">
                      {parsedEvents.filter((e) => e.type === "LECTURE").length}
                    </strong>
                  </span>
                  <span>
                    Exams:{" "}
                    <strong className="text-purple-600">
                      {parsedEvents.filter((e) => e.type === "EXAM").length}
                    </strong>
                  </span>
                </div>

                {pastEventsCount > 0 && (
                  <Badge variant="destructive" size="sm" className="gap-1">
                    {pastEventsCount} event(s) in the past (must be future)
                  </Badge>
                )}
              </div>

              {pastEventsCount > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <div className="flex-1">
                    Some events have start dates in the past. The server
                    strictly rejects past dates. Please edit the JSON or verify
                    the year in the schedule.
                  </div>
                </div>
              )}

              <div className="rounded-xl border divide-y divide-border/40 max-h-[320px] overflow-y-auto bg-card">
                {parsedEvents.map((event, idx) => {
                  const courseInfo = courseMap.get(event.courseId);
                  const isPast =
                    new Date(event.startTime).getTime() < Date.now();
                  const config = getEventCategoryConfig(event.type);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3 text-xs space-y-1.5 transition-colors",
                        isPast && "bg-destructive/5",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          {courseInfo?.abbreviation && (
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted/80 text-foreground shrink-0">
                              [{courseInfo.abbreviation}]
                            </span>
                          )}
                          <span className="font-semibold text-foreground truncate">
                            {event.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight border",
                              config.pillContainer,
                            )}
                          >
                            {event.type}
                          </span>
                          {isPast && (
                            <Badge variant="destructive" size="xs">
                              Past
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatPostDate(event.startTime)}
                        </span>
                        {event.durationHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {event.durationHours}h duration
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {formatEventLocation(event.location)}
                          {event.locationDetails
                            ? ` (${event.locationDetails})`
                            : ""}
                        </span>
                        {courseInfo?.name && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="size-3" />
                            {courseInfo.name}
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-[11px] text-muted-foreground/90 italic">
                          {event.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-border/40 shrink-0 flex items-center justify-between">
          {step === 1 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setStep(2)}
                className="gap-1.5 w-full sm:w-auto"
              >
                <span>Continue to Paste JSON</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                className="gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleValidateJson}
                className="gap-1.5 font-semibold cursor-pointer"
              >
                <span>Validate & Preview</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="gap-1.5"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to JSON</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmImport}
                disabled={
                  isSubmitting ||
                  pastEventsCount > 0 ||
                  parsedEvents.length === 0
                }
                className="gap-1.5 font-semibold cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-3.5" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    <span>Import {parsedEvents.length} Events</span>
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
