import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Sparkles,
  Info,
  ChevronRight,
  Home,
  Users,
  Calendar,
  BookOpen,
  FileText,
  X,
  Lightbulb,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UxNote {
  page: string;
  dbEntities: string[];
  currentFriction: string;
  uxInnovation: string;
  plainEnglishArgument: string;
}

const UX_NOTES: Record<string, UxNote> = {
  home: {
    page: "UniHub Home Dashboard",
    dbEntities: ["COMMUNITIES", "COURSE_OFFERINGS", "EXAMS", "ASSIGNMENTS", "LECTURES", "TEACHERS"],
    currentFriction:
      "Traditional university platforms (like Moodle / Google Classroom) scatter deadlines, past exams, and professor notes into deep disconnected folder trees. Students have to check multiple tabs and lose track of assignment weights and exam rules.",
    uxInnovation:
      "Unified Academic Radar + Deadlines Timeline + Quick Course Launchers. Shows weighted grading milestones (e.g. 60% Project vs 40% Written Exam) directly on the student's daily home feed.",
    plainEnglishArgument:
      "Students care primarily about two things on a daily basis: 'What is due soon?' and 'How do I pass this class?'. Surfacing the exact grade weight and passing shortcuts on the home feed eliminates academic panic and missed deadlines.",
  },
  communities: {
    page: "Communities Hub",
    dbEntities: ["COMMUNITIES", "STUDY_YEARS", "COMMUNITY_MEMBERS", "USERS", "ROLES"],
    currentFriction:
      "University forums often lack structure; students from different academic years or study formats (ID vs IF vs Master) get mixed together, causing irrelevant chatter and outdated materials.",
    uxInnovation:
      "Structured Study-Year Hierarchy (Year 1 -> Year 2 -> Year 3) with verified owner badges, member stats, and direct curriculum roadmap previews.",
    plainEnglishArgument:
      "Categorizing communities strictly by faculty and study year ensures that first-year students immediately find verified syllabi, while alumni and senior students can mentor without cluttering the course feeds.",
  },
  community_detail: {
    page: "Community Detail Page (FMI - Informatica ID)",
    dbEntities: ["COMMUNITIES", "STUDY_YEARS", "COURSES", "COURSE_OFFERINGS", "TEACHERS"],
    currentFriction:
      "When joining a faculty community, students usually see a plain list of folders with no context on semesters, teacher reputations, or overall academic path.",
    uxInnovation:
      "Study Year Visual Cards with Semester Breakdown, Credit Point Counters, Syllabus Highlights, and Professor Directory with transparent student ratings.",
    plainEnglishArgument:
      "Visual cards showing all 6 courses per semester with difficulty indicators give students instant clarity on their workload before the semester even begins.",
  },
  study_year: {
    page: "Study Year Dashboard (Anul 1 - 2025-2026)",
    dbEntities: ["STUDY_YEARS", "COURSE_OFFERINGS", "COURSES", "TEACHERS", "RESOURCES"],
    currentFriction:
      "Navigating courses requires clicking in and out of nested directory folders without seeing which courses require written exams vs project presentations.",
    uxInnovation:
      "Semester 1 & 2 Interactive Matrix with Course Grading Formulas (e.g. '60% Proiect + 40% Examen') and Database Passing Advice Pills (e.g. 'Nota 5 la proiect = Scapare de examen').",
    plainEnglishArgument:
      "Displaying the official passing rule directly on each course card saves students hours of searching through syllabi and reduces anxiety around exam requirements.",
  },
  course: {
    page: "Course Offering Hub (Arhitectura Sistemelor de Calcul)",
    dbEntities: ["COURSE_OFFERINGS", "TEACHERS", "TEACHER_RATINGS", "FOLDERS", "RESOURCES", "POSTS", "ATTACHMENTS"],
    currentFriction:
      "Material files, lecture links, past exams, and student Q&A are usually separated into different systems. Attachment relationships (e.g. linking an exam to sample past exam papers) are lost.",
    uxInnovation:
      "4-Tab Cohesive Hub: 1) Interactive Materials Tree with Search, 2) Milestone & Exam Timeline with 100% Weight Tracker, 3) 5-Metric Teacher Rating Breakdown (Teaching, Fairness, Knowledge, etc.), 4) Community Q&A Board.",
    plainEnglishArgument:
      "Connecting past exam PDFs directly as attachments to scheduled exam events gives students the exact study materials they need at the exact moment they are preparing for the exam.",
  },
  resource: {
    page: "Resource Viewer Modal / Detail",
    dbEntities: ["RESOURCES", "MATERIAL_FILES", "MATERIAL_LINKS", "ASSIGNMENTS", "EXAMS", "LECTURES", "ATTACHMENTS"],
    currentFriction:
      "Clicking a resource in standard university apps either forces an automatic file download or opens an unformatted link without context on who uploaded it, file size, or related attachments.",
    uxInnovation:
      "Context-Aware Resource Modal supporting rich in-place previews for GitHub repos, YouTube lecture playlists, PDF cheatsheets, and countdown-equipped assignments with attached starter code.",
    plainEnglishArgument:
      "Providing a rich preview with one-click actions (Open Repo, Copy Link, Bookmark, Mark as Done) streamlines study sessions and prevents messy local download folders.",
  },
};

export function PrototypeBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);

  // Determine current page key for UX notes
  const pathname = location.pathname;
  let activeKey = "home";
  if (pathname.includes("/course/")) {
    activeKey = "course";
  } else if (pathname.includes("/year/")) {
    activeKey = "study_year";
  } else if (pathname.startsWith("/communities/") && pathname !== "/communities") {
    activeKey = "community_detail";
  } else if (pathname.startsWith("/communities")) {
    activeKey = "communities";
  }

  const currentNote = UX_NOTES[activeKey] || UX_NOTES.home;

  return (
    <>
      <div className="sticky top-14 z-20 w-full border-b border-primary/20 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 backdrop-blur px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Prototype Mode Indicator & Quick Breadcrumb Navigator */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 font-semibold text-primary">
              <Sparkles className="size-3 text-primary animate-pulse" />
              <span>Prototype Flow</span>
            </span>

            {/* Interactive Breadcrumb Flow */}
            <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
              <button
                type="button"
                onClick={() => navigate("/proto")}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors ${
                  pathname === "/proto" || pathname === "/" ? "font-bold text-foreground bg-background/60 shadow-xs" : ""
                }`}
              >
                <Home className="size-3" /> Home
              </button>

              <ChevronRight className="size-3 text-muted-foreground/50" />

              <button
                type="button"
                onClick={() => navigate("/proto/communities")}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors ${
                  pathname === "/proto/communities" || pathname === "/communities" ? "font-bold text-foreground bg-background/60 shadow-xs" : ""
                }`}
              >
                <Users className="size-3" /> Communities
              </button>

              <ChevronRight className="size-3 text-muted-foreground/50" />

              <button
                type="button"
                onClick={() => navigate("/proto/communities/fmi-info-id")}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors ${
                  pathname === "/proto/communities/fmi-info-id" || pathname === "/communities/fmi-info-id" ? "font-bold text-foreground bg-background/60 shadow-xs" : ""
                }`}
              >
                <BookOpen className="size-3" /> FMI Info ID
              </button>

              <ChevronRight className="size-3 text-muted-foreground/50" />

              <button
                type="button"
                onClick={() => navigate("/proto/communities/fmi-info-id/year/1")}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors ${
                  pathname.includes("/year/1") && !pathname.includes("/course/")
                    ? "font-bold text-foreground bg-background/60 shadow-xs"
                    : ""
                }`}
              >
                <Calendar className="size-3" /> Year 1
              </button>

              <ChevronRight className="size-3 text-muted-foreground/50" />

              <button
                type="button"
                onClick={() => navigate("/proto/communities/fmi-info-id/year/1/course/1")}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-background/80 transition-colors ${
                  pathname.includes("/course/1") ? "font-bold text-foreground bg-background/60 shadow-xs" : ""
                }`}
              >
                <FileText className="size-3" /> ASC Course Hub
              </button>
            </div>
          </div>

          {/* Right: UX Innovation Argument Drawer Toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => setShowNotes(!showNotes)}
              className="bg-background/80 hover:bg-background text-foreground border-primary/30 flex items-center gap-1.5 shadow-xs"
            >
              <Lightbulb className="size-3 text-amber-500" />
              <span>UX & DB Rationale</span>
              <span className="rounded-full bg-primary/20 text-primary px-1.5 text-[10px] font-bold">
                {currentNote.dbEntities.length} DB tables
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* UX Innovation & Database Schema Modal / Drawer */}
      {showNotes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl text-card-foreground">
            <button
              type="button"
              onClick={() => setShowNotes(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Lightbulb className="size-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold">UX Proposal & DB Rationale</h3>
                <p className="text-xs text-muted-foreground">{currentNote.page}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
              {/* DB Entities Used */}
              <div className="rounded-lg border bg-muted/40 p-3">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-primary mb-1.5">
                  <Database className="size-3.5" /> Database Tables Used
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentNote.dbEntities.map((entity) => (
                    <span
                      key={entity}
                      className="rounded bg-background px-2 py-0.5 font-mono text-xs text-foreground border shadow-2xs"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conventional Friction */}
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <h4 className="font-semibold text-xs text-destructive mb-1 flex items-center gap-1.5">
                  <span>⚠️ Current Problem / Friction in Conventional Academic Portals</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentNote.currentFriction}
                </p>
              </div>

              {/* Proposed UX Innovation */}
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <h4 className="font-semibold text-xs text-primary mb-1 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" /> Proposed UX Enhancement
                </h4>
                <p className="text-xs text-foreground font-medium leading-relaxed">
                  {currentNote.uxInnovation}
                </p>
              </div>

              {/* Plain English Argument */}
              <div className="rounded-lg border bg-accent/30 p-3">
                <h4 className="font-semibold text-xs text-foreground mb-1 flex items-center gap-1.5">
                  <Info className="size-3.5 text-blue-500" /> Plain English Argument
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentNote.plainEnglishArgument}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button size="sm" onClick={() => setShowNotes(false)}>
                Got it, Continue Exploring
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
