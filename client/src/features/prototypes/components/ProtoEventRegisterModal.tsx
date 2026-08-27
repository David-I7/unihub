import { useState } from "react";
import {
  X,
  Calendar,
  AlertCircle,
  FileText,
  Video,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MockCalendarEvent,
  CalendarEventType,
  LocationType,
} from "../data/mockCalendarData";
import { MOCK_COURSE_OFFERINGS_YEAR_1, MOCK_COURSE_OFFERINGS_YEAR_2 } from "../data/mockAcademicData";

interface ProtoEventRegisterModalProps {
  isOpen: boolean;
  defaultDate?: string;
  onClose: () => void;
  onSaveEvent: (newEvent: MockCalendarEvent) => void;
}

const AVAILABLE_COURSES = [
  ...MOCK_COURSE_OFFERINGS_YEAR_1.map((c) => ({
    id: c.id,
    courseId: c.courseId,
    courseAbbr: c.courseAbbr,
    courseName: c.courseName,
    communityId: "fmi-info-id",
    communityName: "FMI - Informatica ID",
    studyYearId: 1,
    studyYearName: "Anul 1 (2025-2026)",
  })),
  ...MOCK_COURSE_OFFERINGS_YEAR_2.map((c) => ({
    id: c.id,
    courseId: c.courseId,
    courseAbbr: c.courseAbbr,
    courseName: c.courseName,
    communityId: "fmi-info-id",
    communityName: "FMI - Informatica ID",
    studyYearId: 2,
    studyYearName: "Anul 2 (2026-2027)",
  })),
];

export function ProtoEventRegisterModal({
  isOpen,
  defaultDate,
  onClose,
  onSaveEvent,
}: ProtoEventRegisterModalProps) {
  const [eventType, setEventType] = useState<CalendarEventType>("EXAM");
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(defaultDate || "2026-01-20");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("12:00");
  
  // Specific fields
  const [gradeWeight, setGradeWeight] = useState(40);
  const [roomOrPlatform, setRoomOrPlatform] = useState("Amfiteatrul Spiru Haret");
  const [locationType, setLocationType] = useState<LocationType>("IN_PERSON");
  const [meetingUrl, setMeetingUrl] = useState("https://meet.google.com/unihub-asc-live");
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(120);
  const [passingNotes, setPassingNotes] = useState("");
  const [attachmentTitle, setAttachmentTitle] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course = AVAILABLE_COURSES[selectedCourseIndex] || AVAILABLE_COURSES[0];

    const attachments = attachmentTitle.trim()
      ? [
          {
            id: `att-${Date.now()}`,
            title: attachmentTitle,
            url: attachmentUrl.trim() || undefined,
            type: attachmentUrl.startsWith("http") ? ("link" as const) : ("file" as const),
          },
        ]
      : undefined;

    const newEvent: MockCalendarEvent = {
      id: `cal-custom-${Date.now()}`,
      type: eventType,
      title: title.trim() || (eventType === "EXAM" ? `Examen ${course.courseAbbr}` : eventType === "ASSIGNMENT" ? `Tema ${course.courseAbbr}` : `Curs ${course.courseAbbr}`),
      description: description.trim() || undefined,
      date,
      startTime,
      endTime: eventType === "LECTURE" || eventType === "EXAM" ? endTime : undefined,
      communityId: course.communityId,
      communityName: course.communityName,
      studyYearId: course.studyYearId,
      studyYearName: course.studyYearName,
      courseOfferingId: course.id,
      courseAbbr: course.courseAbbr,
      courseName: course.courseName,
      gradeWeight: eventType !== "LECTURE" ? Number(gradeWeight) : undefined,
      roomOrPlatform: locationType === "ONLINE" ? "Google Meet" : roomOrPlatform,
      locationType: eventType === "LECTURE" ? locationType : undefined,
      meetingUrl: locationType === "ONLINE" ? meetingUrl : undefined,
      estimatedDurationMinutes: Number(estimatedDurationMinutes),
      passingNotes: passingNotes.trim() || undefined,
      attachments,
      isStarred: true,
    };

    setIsSuccess(true);
    setTimeout(() => {
      onSaveEvent(newEvent);
      setIsSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Calendar className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">
                Register Academic Event
              </h3>
              <p className="text-xs text-muted-foreground">
                Add an Exam, Lecture, or Assignment to the community calendar
              </p>
            </div>
          </div>

          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Segmented Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Event Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEventType("EXAM")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  eventType === "EXAM"
                    ? "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <AlertCircle className="size-4 text-rose-500" />
                <span>Exam</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType("ASSIGNMENT")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  eventType === "ASSIGNMENT"
                    ? "border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <FileText className="size-4 text-amber-500" />
                <span>Assignment / Project</span>
              </button>

              <button
                type="button"
                onClick={() => setEventType("LECTURE")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all cursor-pointer ${
                  eventType === "LECTURE"
                    ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <Video className="size-4 text-blue-500" />
                <span>Lecture / Seminar</span>
              </button>
            </div>
          </div>

          {/* Linked Course Offering Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Link to Academic Course Offering
            </label>
            <select
              value={selectedCourseIndex}
              onChange={(e) => setSelectedCourseIndex(Number(e.target.value))}
              className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
            >
              {AVAILABLE_COURSES.map((course, idx) => (
                <option key={`${course.courseAbbr}-${course.studyYearId}-${idx}`} value={idx}>
                  [{course.courseAbbr}] {course.courseName} • {course.studyYearName} ({course.communityName})
                </option>
              ))}
            </select>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-foreground">
                Event Title
              </label>
              <input
                type="text"
                required
                placeholder={
                  eventType === "EXAM"
                    ? "e.g., Examen Scris Sesiunea de Iarna"
                    : eventType === "ASSIGNMENT"
                    ? "e.g., Proiect Practic MIPS Assembly / GitHub Repo"
                    : "e.g., Curs Saptamanal: Arhitecturi Multicore"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">
                Description / Syllabus Details
              </label>
              <textarea
                rows={2}
                placeholder="Include topics covered, allowed materials, submission instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-foreground">
                {eventType === "ASSIGNMENT" ? "Due Date" : "Date"}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">
                {eventType === "ASSIGNMENT" ? "Due Time" : "Start Time"}
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
              />
            </div>

            {eventType !== "ASSIGNMENT" && (
              <div>
                <label className="text-xs font-bold text-foreground">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* Type Specific Fields */}
          {eventType === "EXAM" && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="size-4" /> Exam Configuration
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-foreground">Room / Platform</label>
                  <input
                    type="text"
                    value={roomOrPlatform}
                    onChange={(e) => setRoomOrPlatform(e.target.value)}
                    placeholder="e.g. Amfiteatrul Spiru Haret / Corp FMI"
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground">Grade Weight (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gradeWeight}
                    onChange={(e) => setGradeWeight(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-medium text-foreground text-xs">Exam Policy / Notes</label>
                <input
                  type="text"
                  value={passingNotes}
                  onChange={(e) => setPassingNotes(e.target.value)}
                  placeholder="e.g. Open-notes: se accepta doar caietul de curs scris de mana"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          )}

          {eventType === "ASSIGNMENT" && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <FileText className="size-4" /> Assignment & Project Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-foreground">Grade Weight (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={gradeWeight}
                    onChange={(e) => setGradeWeight(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground">Estimated Work (Minutes)</label>
                  <input
                    type="number"
                    min={30}
                    step={30}
                    value={estimatedDurationMinutes}
                    onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-medium text-foreground text-xs">Passing Exemption / Bonus Tip</label>
                <input
                  type="text"
                  value={passingNotes}
                  onChange={(e) => setPassingNotes(e.target.value)}
                  placeholder="e.g. Nota >= 5 la acest proiect scutește studentul de examenul scris"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            </div>
          )}

          {eventType === "LECTURE" && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <Video className="size-4" /> Lecture & Location Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-foreground">Location Type</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as LocationType)}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="ONLINE">Online (Google Meet / Zoom)</option>
                    <option value="IN_PERSON">In-Person (Faculty Amphitheater)</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground">
                    {locationType === "ONLINE" ? "Meeting URL" : "Amphitheater / Room"}
                  </label>
                  <input
                    type="text"
                    value={locationType === "ONLINE" ? meetingUrl : roomOrPlatform}
                    onChange={(e) =>
                      locationType === "ONLINE"
                        ? setMeetingUrl(e.target.value)
                        : setRoomOrPlatform(e.target.value)
                    }
                    placeholder={locationType === "ONLINE" ? "https://meet.google.com/..." : "Sala 214"}
                    className="mt-1 w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Attachments / Starter Resource */}
          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-2 text-xs">
            <label className="font-bold text-foreground flex items-center gap-1.5">
              <LinkIcon className="size-3.5 text-primary" /> Attach Material / Starter File (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={attachmentTitle}
                onChange={(e) => setAttachmentTitle(e.target.value)}
                placeholder="Title e.g. Enunt_Tema_2026.pdf"
                className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
              <input
                type="text"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="URL e.g. https://github.com/..."
                className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Success message or Submit button */}
          {isSuccess ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
              <CheckCircle2 className="size-4" /> Event registered successfully into the calendar!
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="gap-1.5 font-semibold">
                <Sparkles className="size-3.5" /> Save to Calendar
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
