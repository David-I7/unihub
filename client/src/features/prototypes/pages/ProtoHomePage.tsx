import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Sparkles,
  Users,
  Search,
  ChevronRight,
  Star,
  Video,
  Bell,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { ProtoResourceModal } from "../components/ProtoResourceModal";
import { ProtoTeacherReviewModal } from "../components/ProtoTeacherReviewModal";
import {
  MOCK_COMMUNITIES,
  MOCK_COURSE_OFFERINGS_YEAR_1,
  MOCK_TEACHERS,
  MOCK_NOTIFICATIONS,
  getUserRatings,
  type MockResource,
  type MockTeacher,
  type MockNotification,
} from "../data/mockAcademicData";

export default function ProtoHomePage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [selectedResource, setSelectedResource] = useState<MockResource | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<MockTeacher | null>(null);
  const [notificationFilter, setNotificationFilter] = useState<"ALL" | "EXAM" | "ASSIGNMENT" | "LECTURE">("ALL");
  const [notifications, setNotifications] = useState<MockNotification[]>(MOCK_NOTIFICATIONS);
  const [courseSearch, setCourseSearch] = useState("");

  const userRatings = getUserRatings();
  const userCommunities = MOCK_COMMUNITIES.filter((c) => c.isJoined || c.id === "fmi-info-id");

  const filteredNotifications = notifications.filter((n) =>
    notificationFilter === "ALL" ? true : n.type === notificationFilter
  );

  const toggleStarNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isStarred: !n.isStarred } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filteredCourses = MOCK_COURSE_OFFERINGS_YEAR_1.filter(
    (c) =>
      c.courseName.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.courseAbbr.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Breadcrumb & UX Notes */}
      <PrototypeBanner />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-emerald-800 to-slate-900 p-6 md:p-8 text-primary-foreground shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-xs font-medium">
              <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
              <span>UniHub 2.0 Academic Workflow</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back{user ? `, ${user.username}` : " to UniHub"}! 🎓
            </h1>
            <p className="text-xs md:text-sm text-primary-foreground/80 leading-relaxed">
              Your personalized academic command center. Track your enrolled communities, starred deadline notifications, and professor feedback history.
            </p>

            {/* Quick Context Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="rounded-md bg-white/20 px-2.5 py-1 font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <Users className="size-3.5" /> {userCommunities.length} Enrolled Communities
              </span>
              <span className="rounded-md bg-white/15 px-2.5 py-1 backdrop-blur-xs">
                Active Year: Anul 1 (2025-2026)
              </span>
              <span className="rounded-md bg-white/15 px-2.5 py-1 backdrop-blur-xs">
                30 ECTS Enrolled
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/proto/communities/fmi-info-id/year/1/course/1")}
              className="bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-xs flex items-center justify-center gap-1.5"
            >
              <BookOpen className="size-4 text-primary" /> Open ASC Course Hub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/proto/communities")}
              className="border-white/30 text-white hover:bg-white/10 flex items-center justify-center gap-1.5"
            >
              <Search className="size-4" /> Find More Communities
            </Button>
          </div>
        </div>

        {/* Ambient Decorative Background Glows */}
        <div className="absolute -right-12 -bottom-12 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-12 -top-12 size-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      {/* SECTION 1: COMMUNITIES THE USER IS A PART OF */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-base md:text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="size-5 text-primary" /> My Enrolled Communities
            </h2>
            <p className="text-xs text-muted-foreground">
              Communities where you are an active member, moderator, or owner.
            </p>
          </div>

          <Button
            size="xs"
            variant="outline"
            onClick={() => navigate("/proto/communities")}
            className="gap-1 self-start sm:self-auto"
          >
            <Search className="size-3.5" /> Explore All ({MOCK_COMMUNITIES.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userCommunities.map((comm) => (
            <div
              key={comm.id}
              onClick={() => navigate(`/proto/communities/${comm.id}`)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-muted/15 p-4 hover:border-primary/60 hover:bg-muted/30 transition-all cursor-pointer shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[11px] font-bold">
                    {comm.id === "fmi-info-id" ? "OWNER" : "MEMBER"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {comm.memberCount} members
                  </span>
                </div>

                <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {comm.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {comm.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Active: <strong>Anul 1</strong>
                </span>
                <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Enter Hub <ChevronRight className="size-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-COLUMN MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: NOTIFICATIONS (STARRED LECTURES, EXAMS, ASSIGNMENTS WITH 1-DAY/1-WEEK/1-MONTH URGENCY) */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 2: STARRED NOTIFICATIONS TIMELINE */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Bell className="size-5" />
                </div>
                <div>
                  <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                    Starred Deadline Notifications
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Alerts categorized by urgency: 1 Day, 1 Week, and 1 Month before target dates
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" onClick={markAllRead} className="text-xs">
                  Mark all read
                </Button>
              </div>
            </div>

            {/* Notification Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setNotificationFilter("ALL")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  notificationFilter === "ALL"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setNotificationFilter("ASSIGNMENT")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  notificationFilter === "ASSIGNMENT"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Assignments (Projects)
              </button>
              <button
                type="button"
                onClick={() => setNotificationFilter("EXAM")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  notificationFilter === "EXAM"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Exams (Written / Oral)
              </button>
              <button
                type="button"
                onClick={() => setNotificationFilter("LECTURE")}
                className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  notificationFilter === "LECTURE"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Live Lectures
              </button>
            </div>

            {/* Notification Cards Feed */}
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isOneDay = notif.urgency === "ONE_DAY";
                const isOneWeek = notif.urgency === "ONE_WEEK";
                const isOneMonth = notif.urgency === "ONE_MONTH";

                return (
                  <div
                    key={notif.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 transition-all shadow-2xs ${
                      isOneDay
                        ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60"
                        : isOneWeek
                        ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60"
                        : "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/60"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Urgency Badge */}
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                            isOneDay
                              ? "bg-rose-600 text-white animate-pulse"
                              : isOneWeek
                              ? "bg-amber-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {isOneDay && "🚨 1 Day Before"}
                          {isOneWeek && "⚠️ 1 Week Before"}
                          {isOneMonth && "📅 1 Month Before"}
                        </span>

                        <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground">
                          {notif.courseAbbr}
                        </span>

                        <span className="text-xs font-bold text-foreground">
                          {notif.title}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notif.description || notif.urgencyLabel} • Target:{" "}
                        <strong>{new Date(notif.targetDate).toLocaleDateString()}</strong>
                        {notif.locationOrRoom && ` (${notif.locationOrRoom})`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      {notif.gradeWeight && (
                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground">
                            {notif.gradeWeight}% Weight
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleStarNotification(notif.id)}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        title={notif.isStarred ? "Starred" : "Unstar"}
                      >
                        <Star
                          className={`size-4 ${
                            notif.isStarred ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
                          }`}
                        />
                      </button>

                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          setSelectedResource({
                            id: notif.resourceId,
                            folderId: null,
                            ownerId: "u-david",
                            ownerName: "David Iosub",
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            title: notif.title,
                            type: notif.type === "ASSIGNMENT" ? "ASSIGNMENT" : notif.type === "EXAM" ? "EXAM" : "LECTURE",
                            description: notif.description,
                            assignmentData: notif.type === "ASSIGNMENT" ? { id: notif.resourceId, dueDate: notif.targetDate, gradeWeight: notif.gradeWeight || 60 } : undefined,
                            examData: notif.type === "EXAM" ? { id: notif.resourceId, scheduledDate: notif.targetDate, gradeWeight: notif.gradeWeight || 40, roomOrPlatform: notif.locationOrRoom } : undefined,
                            lectureData: notif.type === "LECTURE" ? { id: notif.resourceId, startTime: notif.targetDate, endTime: notif.targetDate, location: "ONLINE", meetingUrl: "https://meet.google.com/unihub-asc-live" } : undefined,
                          })
                        }
                        className="bg-background gap-1 text-xs"
                      >
                        View <ChevronRight className="size-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE SEMESTER COURSES MATRIX */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-bold text-foreground">
                  Semester 1 Courses (Anul 1)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Interactive course hubs with VS Code file explorer, grading formulas, and professor reviews
                </p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter courses..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/proto/communities/fmi-info-id/year/1/course/${course.id}`)}
                  className="flex flex-col justify-between rounded-xl border bg-muted/15 p-4 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-primary/10 text-primary font-mono text-xs font-bold px-2 py-0.5">
                        {course.courseAbbr}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {course.passingDifficulty === "easy" ? "Scapare Examen ✓" : "Standard"}
                      </span>
                    </div>

                    <h3 className="font-heading text-xs font-bold text-foreground line-clamp-1">
                      {course.courseName}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">
                      Prof. {course.teachers[0]?.lastName}
                    </span>
                    <span className="font-bold text-primary flex items-center gap-0.5">
                      Open Hub <ChevronRight className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT 1 COLUMN: USER PROFESSOR RATINGS & RECENT REVIEWS */}
        <div className="space-y-6">
          {/* SECTION 3: USER PROFESSOR RATINGS */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Star className="size-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground">
                    My Professor Ratings
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Evaluations you submitted
                  </p>
                </div>
              </div>

              <Button
                size="xs"
                onClick={() => setSelectedTeacher(MOCK_TEACHERS.dragulici)}
                className="gap-1 shadow-2xs"
              >
                <Plus className="size-3" /> Rate
              </Button>
            </div>

            {/* User Ratings List */}
            <div className="space-y-3">
              {userRatings.map((rating) => (
                <div
                  key={rating.id}
                  className="rounded-xl border bg-muted/15 p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {rating.teacherName || "Professor Evaluation"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-primary">
                    "{rating.title}"
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                    {rating.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1 border-t border-dashed">
                    {rating.metricValues.slice(0, 3).map((mv) => (
                      <span
                        key={mv.ratingMetricId}
                        className="rounded bg-background px-1.5 py-0.5 text-[9px] text-foreground border"
                      >
                        {mv.metricName.split(" ")[0]}: <strong>{mv.value}/5</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: TODAY'S LIVE LECTURE SESSION */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
                <Video className="size-4 text-purple-600 dark:text-purple-400" /> Today's Live Lecture
              </h3>
              <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="rounded-xl border bg-purple-500/5 p-4 space-y-2 text-xs">
              <span className="font-bold text-foreground">ASC - Pipeline & CPU Architecture</span>
              <p className="text-[11px] text-muted-foreground">
                Wednesdays • 16:00 - 18:00 (Google Meet)
              </p>
              <a
                href="https://meet.google.com/unihub-asc-live"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors shadow-xs"
              >
                <Video className="size-3.5" /> Join Meeting Room
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Inspector Modal */}
      <ProtoResourceModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />

      {/* Teacher Rating Modal */}
      <ProtoTeacherReviewModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </div>
  );
}
