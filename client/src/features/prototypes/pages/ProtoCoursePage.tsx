import { useState } from "react";
import { useParams } from "react-router";
import {
  Calendar,
  Award,
  Star,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Plus,
  Paperclip,
  CheckCircle2,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { ProtoResourceModal } from "../components/ProtoResourceModal";
import { ProtoTeacherReviewModal } from "../components/ProtoTeacherReviewModal";
import { VsCodeTreeExplorer } from "../components/VsCodeTreeExplorer";
import {
  getCommunityById,
  getStudyYear,
  getCourseOffering,
  type MockResource,
  type MockTeacher,
} from "../data/mockAcademicData";

export default function ProtoCoursePage() {
  const {
    communityId = "fmi-info-id",
    yearId = "1",
    courseOfferingId = "1",
  } = useParams();

  const [activeTab, setActiveTab] = useState<"vscode_tree" | "timeline" | "faculty" | "discussions">("vscode_tree");
  const [selectedResource, setSelectedResource] = useState<MockResource | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<MockTeacher | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDesc, setNewPostDesc] = useState("");
  const [postsList, setPostsList] = useState<any[]>([]);

  const community = getCommunityById(communityId);
  const studyYear = getStudyYear(communityId, yearId);
  const courseOffering = getCourseOffering(communityId, yearId, courseOfferingId);

  // Initialize posts on mount
  useState(() => {
    if (courseOffering?.posts) {
      setPostsList(courseOffering.posts);
    }
  });

  if (!community || !studyYear || !courseOffering) {
    return <div className="p-6">Course offering not found.</div>;
  }

  const primaryTeacher = courseOffering.teachers[0];

  const handleLikePost = (postId: string) => {
    setPostsList((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          : p
      )
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newPost = {
      id: `post-user-${Date.now()}`,
      ownerId: "u-david",
      ownerName: "David Iosub",
      courseOfferingId: courseOffering.id,
      title: newPostTitle,
      description: newPostDesc,
      likesCount: 1,
      isLiked: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      commentsCount: 0,
    };

    setPostsList([newPost, ...postsList]);
    setNewPostTitle("");
    setNewPostDesc("");
  };

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Breadcrumb & UX Notes */}
      <PrototypeBanner />

      {/* Course Header Banner */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-primary px-3 py-1 font-mono text-xs font-bold text-primary-foreground">
                {courseOffering.courseAbbr}
              </span>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                Semestrul {courseOffering.semester}
              </span>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                {studyYear.displayName.split(" ")[0]} {studyYear.displayName.split(" ")[1]}
              </span>
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                {courseOffering.creditPoints || 5} ECTS
              </span>
            </div>

            <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {courseOffering.courseName}
            </h1>
          </div>

          {/* Professor Quick Chip */}
          {primaryTeacher && (
            <div
              onClick={() => setSelectedTeacher(primaryTeacher)}
              className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3 hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer shrink-0"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary text-xs font-bold">
                {primaryTeacher.lastName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">
                  Prof. {primaryTeacher.firstName} {primaryTeacher.lastName}
                </p>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>{primaryTeacher.averageRating.toFixed(1)} / 5.0</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    ({primaryTeacher.ratingsCount} reviews)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Database Passing Strategy & Exam Tips Box */}
        {courseOffering.description && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-primary mb-1">
              <Sparkles className="size-4 text-primary" />
              <span>Syllabus Passing Strategy & Grading Rules</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {courseOffering.description}
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b pt-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("vscode_tree")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "vscode_tree"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-4" /> VS Code Directory Explorer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="size-4" /> Exams & Deadlines (100% Weight)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("faculty")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "faculty"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="size-4" /> Faculty Radar & Feedback
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("discussions")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs md:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "discussions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-4" /> Student Q&A ({postsList.length})
          </button>
        </div>
      </div>

      {/* TAB 1: VS CODE-STYLE DIRECTORY EXPLORER (Core Refinement) */}
      {activeTab === "vscode_tree" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <Code2 className="size-5 text-primary" /> VS Code Course Directory Explorer
            </h3>
            <span className="text-xs text-muted-foreground">
              Click folders to expand/collapse • Select files to preview code, notes, and specs
            </span>
          </div>

          <VsCodeTreeExplorer
            offering={courseOffering}
            onOpenResourceDetail={(res) => setSelectedResource(res)}
          />
        </div>
      )}

      {/* TAB 2: EXAMS & ASSIGNMENTS PLANNER */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* 100% Grade Formula Visualizer */}
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <Award className="size-5 text-primary" /> Grade Weight Breakdown (Formula)
            </h3>

            <div className="space-y-2">
              <div className="flex h-5 w-full overflow-hidden rounded-xl bg-muted p-0.5 gap-0.5">
                <div
                  className="bg-amber-500 rounded-lg text-[10px] font-bold text-amber-950 flex items-center justify-center transition-all"
                  style={{ width: "60%" }}
                >
                  60% Proiect MIPS
                </div>
                <div
                  className="bg-rose-500 rounded-lg text-[10px] font-bold text-white flex items-center justify-center transition-all"
                  style={{ width: "40%" }}
                >
                  40% Examen Scris
                </div>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" /> Proiect Practic (60%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500" /> Examen Scris Sesiune (40%)
                </span>
                <span className="font-bold text-primary">Total: 100% Required</span>
              </div>
            </div>
          </div>

          {/* Timeline Milestones Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project MIPS Milestone */}
            <div
              onClick={() =>
                setSelectedResource(courseOffering.folders[2]?.resources[0] || null)
              }
              className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4 cursor-pointer hover:border-amber-500/60 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  60% Grade Weight
                </span>
                <span className="text-xs font-bold text-muted-foreground">Due: Jan 20, 2026</span>
              </div>

              <div>
                <h4 className="font-heading text-lg font-bold text-foreground">
                  Proiect MIPS Assembly (Criptare / Procesare Imagini)
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Implementarea algoritmului cerut in limbaj de asamblare MIPS32.
                </p>
              </div>

              <div className="rounded-xl border bg-background p-3 text-xs space-y-1">
                <p className="font-semibold text-foreground">Passing Exemption Rule:</p>
                <p className="text-muted-foreground">
                  Daca obtineti nota <strong>≥ 5.0</strong> la acest proiect, promovarea este garantata si sunteti scutit de examenul scris!
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Paperclip className="size-3.5" /> 1 Starter Attachment
                </span>
                <Button size="xs">View Specification</Button>
              </div>
            </div>

            {/* Written Exam Milestone */}
            <div
              onClick={() =>
                setSelectedResource(courseOffering.folders[1]?.resources[0] || null)
              }
              className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 space-y-4 cursor-pointer hover:border-rose-500/60 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                  40% Grade Weight
                </span>
                <span className="text-xs font-bold text-muted-foreground">Date: Jan 20, 2026 • 18:00</span>
              </div>

              <div>
                <h4 className="font-heading text-lg font-bold text-foreground">
                  Examen Scris Sesiunea Iarna 2026
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Examenul scris clasic pe baza teoriei de procesor si microarhitectura.
                </p>
              </div>

              <div className="rounded-xl border bg-background p-3 text-xs space-y-1">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" /> Exam Notes Rule:
                </p>
                <p className="text-muted-foreground">
                  <strong>Aveti voie cu materiale scrise de mana</strong> la examen! Folositi sintezele din folderul Materiale.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                  <Paperclip className="size-3.5" /> Past Exams Attached
                </span>
                <Button size="xs" variant="destructive">
                  Prep Past Exams
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FACULTY RADAR & FEEDBACK */}
      {activeTab === "faculty" && primaryTeacher && (
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
              <div className="flex items-center gap-4">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary text-xl font-bold">
                  {primaryTeacher.lastName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">
                    Prof. {primaryTeacher.firstName} {primaryTeacher.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {primaryTeacher.department} • {primaryTeacher.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-amber-500 font-bold text-sm">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span>{primaryTeacher.averageRating.toFixed(1)} / 5.0</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      (based on {primaryTeacher.ratingsCount} student evaluations)
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setSelectedTeacher(primaryTeacher)}
                className="gap-1.5 shrink-0"
              >
                <Sparkles className="size-4" /> Rate Professor & Leave Tip
              </Button>
            </div>

            {/* Student Reviews Stream */}
            <div className="space-y-4">
              <h4 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="size-4 text-primary" /> Verified Student Experiences & Tips
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {primaryTeacher.ratings?.map((r) => (
                  <div key={r.id} className="rounded-xl border bg-muted/15 p-4 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{r.title}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      "{r.description}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-dashed">
                      {r.metricValues.map((mv) => (
                        <span
                          key={mv.ratingMetricId}
                          className="rounded bg-background px-2 py-0.5 text-[10px] font-medium text-foreground border"
                        >
                          {mv.metricName}: <strong>{mv.value}/5</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT DISCUSSIONS & Q&A */}
      {activeTab === "discussions" && (
        <div className="space-y-6">
          {/* Ask Question / Post Form */}
          <form
            onSubmit={handleCreatePost}
            className="rounded-2xl border bg-card p-5 shadow-xs space-y-3"
          >
            <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" /> Ask a Question or Share a Course Tip
            </h3>

            <input
              type="text"
              required
              placeholder="Question headline (e.g., MARS simulator stack alignment issue)..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              className="w-full rounded-xl border bg-background px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
            />

            <textarea
              rows={2}
              required
              placeholder="Describe your question or advice clearly..."
              value={newPostDesc}
              onChange={(e) => setNewPostDesc(e.target.value)}
              className="w-full rounded-xl border bg-background px-3.5 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
            />

            <div className="flex justify-end">
              <Button size="sm" type="submit" className="gap-1.5">
                <Plus className="size-4" /> Post to Course Feed
              </Button>
            </div>
          </form>

          {/* Posts Feed */}
          <div className="space-y-4">
            {postsList.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border bg-card p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-xs">
                      {post.ownerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-foreground">{post.ownerName}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer ${
                      post.isLiked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    <ThumbsUp className="size-3.5" />
                    <span>{post.likesCount} Helpful</span>
                  </button>
                </div>

                <h4 className="font-heading text-sm font-bold text-foreground">
                  {post.title}
                </h4>

                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {post.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resource Viewer Modal */}
      <ProtoResourceModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onOpenAttachment={(att) => {
          if (att.url) window.open(att.url, "_blank");
        }}
      />

      {/* Teacher Rating Modal */}
      <ProtoTeacherReviewModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </div>
  );
}
