import { useState } from "react";
import { useNavigate } from "react-router";
import {
  X,
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Users,
  Mail,
  MapPin,
  Clock,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  DetailedTeacher,
  TeacherStudentReview,
} from "../data/mockTeachersData";

interface ProtoTeacherDetailModalProps {
  teacher: DetailedTeacher | null;
  onClose: () => void;
  onAddReview?: (teacherId: string, review: TeacherStudentReview) => void;
}

export function ProtoTeacherDetailModal({
  teacher,
  onClose,
  onAddReview,
}: ProtoTeacherDetailModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"STATS" | "COURSES" | "COMMUNITIES" | "REVIEWS">("STATS");
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [selectedCourseAbbr, setSelectedCourseAbbr] = useState("");
  const [metricScores, setMetricScores] = useState({
    teaching: 5,
    punctuality: 5,
    communication: 5,
    knowledge: 5,
    fairness: 5,
  });
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!teacher) return null;

  const handleScoreChange = (metric: keyof typeof metricScores, score: number) => {
    setMetricScores((prev) => ({ ...prev, [metric]: score }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const averageSubmittedScore = Math.round(
      (metricScores.teaching +
        metricScores.punctuality +
        metricScores.communication +
        metricScores.knowledge +
        metricScores.fairness) /
        5
    );

    const newReview: TeacherStudentReview = {
      id: `rev-${Date.now()}`,
      studentName: "Verified Peer",
      studentRole: "Student Anul 1 ID",
      courseName:
        teacher.coursesTaught.find((c) => c.courseAbbr === selectedCourseAbbr)
          ?.courseName || teacher.coursesTaught[0]?.courseName || "General Evaluation",
      courseAbbr: selectedCourseAbbr || teacher.coursesTaught[0]?.courseAbbr || "GEN",
      rating: averageSubmittedScore,
      title: reviewTitle.trim() || "Constructive Academic Feedback",
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString(),
      isVerified: true,
      metricScores: { ...metricScores },
    };

    if (onAddReview) {
      onAddReview(teacher.id, newReview);
    }

    setSubmittedSuccess(true);
    setTimeout(() => {
      setIsWritingReview(false);
      setSubmittedSuccess(false);
      setReviewTitle("");
      setReviewComment("");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        {/* Modal Top Profile Header */}
        <div className="relative border-b bg-gradient-to-r from-primary/15 via-emerald-500/10 to-teal-500/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex size-14 items-center justify-center rounded-2xl font-bold text-white text-xl shadow-md ${teacher.avatarColor}`}
              >
                {teacher.avatarInitials}
              </div>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold">
                    {teacher.academicTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {teacher.department}
                  </span>
                </div>
                <h2 className="font-heading text-xl md:text-2xl font-extrabold text-foreground">
                  {teacher.firstName} {teacher.lastName}
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {teacher.faculty}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-amber-500">
                  <Star className="size-4 fill-amber-500" />
                  <span className="text-xl font-extrabold font-heading text-foreground">
                    {teacher.averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    / 5.0
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {teacher.ratingsCount} verified reviews
                </p>
              </div>

              <Button size="icon-sm" variant="ghost" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Quick Contact Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-primary/10 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Mail className="size-3.5 text-primary" />
              <a href={`mailto:${teacher.email}`} className="hover:underline text-foreground">
                {teacher.email}
              </a>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" /> {teacher.officeLocation}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-primary" /> {teacher.officeHours}
            </span>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b bg-muted/30 px-6 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("STATS")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "STATS"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="size-3.5" /> Detailed Stats & Metrics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COURSES")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "COURSES"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="size-3.5" /> Courses Taught ({teacher.coursesTaught.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("COMMUNITIES")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "COMMUNITIES"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="size-3.5" /> Communities ({teacher.communities.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("REVIEWS")}
            className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "REVIEWS"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <MessageSquare className="size-3.5" /> Student Reviews ({teacher.reviews.length})
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: DETAILED STATS & 5-METRIC RATINGS */}
          {activeTab === "STATS" && (
            <div className="space-y-6">
              {/* Bio Banner */}
              <div className="rounded-xl border bg-muted/15 p-4 space-y-1 leading-relaxed">
                <h4 className="font-bold text-foreground">Academic Biography</h4>
                <p className="text-muted-foreground">{teacher.bio}</p>
              </div>

              {/* 5 Academic Metrics Breakdown */}
              <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                    <Award className="size-4 text-primary" /> 5-Metric Performance Index
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Top 5% Faculty Tier
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {teacher.metrics.map((metric) => (
                    <div key={metric.metricId} className="space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-foreground">{metric.metricName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[11px]">
                            {metric.percentage}%
                          </span>
                          <span className="font-bold text-primary font-mono">
                            {metric.score.toFixed(1)} / 5.0
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${metric.percentage}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {metric.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating Distribution (5-star, 4-star, ...) */}
              <div className="rounded-2xl border bg-card p-5 space-y-3 shadow-xs">
                <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" /> Rating Score Distribution
                </h4>

                <div className="space-y-2 pt-1">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count =
                      teacher.ratingDistribution[
                        stars as keyof typeof teacher.ratingDistribution
                      ] || 0;
                    const percent =
                      teacher.ratingsCount > 0
                        ? Math.round((count / teacher.ratingsCount) * 100)
                        : 0;

                    return (
                      <div key={stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-medium text-foreground flex items-center gap-1 shrink-0">
                          {stars} <Star className="size-3 fill-amber-500 text-amber-500" />
                        </span>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-muted-foreground font-mono text-[11px] shrink-0">
                          {count} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSES TAUGHT WITH DIRECT LINKS */}
          {activeTab === "COURSES" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading font-bold text-sm text-foreground">
                    Curriculum & Course Offerings
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Courses led by Prof. {teacher.lastName} across all active study years
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {teacher.coursesTaught.map((course) => (
                  <div
                    key={`${course.courseAbbr}-${course.studyYearId}`}
                    className="rounded-xl border bg-muted/15 p-4 space-y-3 hover:border-primary/50 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-primary text-primary-foreground font-mono font-bold px-2 py-0.5 text-xs">
                            {course.courseAbbr}
                          </span>
                          <h5 className="font-heading font-bold text-sm text-foreground">
                            {course.courseName}
                          </h5>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          {course.studyYearDisplayName} • Semestrul {course.semester} • {course.creditPoints} Credite ECTS
                        </p>
                      </div>

                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => {
                          onClose();
                          navigate(
                            `/proto/communities/${course.communityId}/year/${course.studyYearId}/course/${course.courseOfferingId}`
                          );
                        }}
                        className="gap-1 shadow-2xs self-start sm:self-auto font-semibold"
                      >
                        <BookOpen className="size-3" /> Open Course Hub ↗
                      </Button>
                    </div>

                    {course.syllabusAdvice && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs">
                        <p className="font-semibold text-primary">
                          💡 Syllabus Tip & Exam Advice:
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          {course.syllabusAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNITIES IN WHICH THE TEACHER APPEARS */}
          {activeTab === "COMMUNITIES" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading font-bold text-sm text-foreground">
                  Associated Communities & Academic Programs
                </h4>
                <p className="text-muted-foreground text-xs">
                  Faculties, degrees, and student community portals where this professor is listed
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teacher.communities.map((comm) => (
                  <div
                    key={comm.communityId}
                    onClick={() => {
                      onClose();
                      navigate(`/proto/communities/${comm.communityId}`);
                    }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-4 hover:border-primary/60 transition-all cursor-pointer shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                          {comm.role}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {comm.memberCount} members
                        </span>
                      </div>

                      <h5 className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {comm.communityName}
                      </h5>
                    </div>

                    <div className="mt-4 pt-2.5 border-t flex items-center justify-between text-xs text-primary font-semibold">
                      <span>View Faculty Hub</span>
                      <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS & INTERACTIVE REVIEW SUBMISSION */}
          {activeTab === "REVIEWS" && (
            <div className="space-y-6">
              {/* Write Review Toggle Header */}
              {!isWritingReview ? (
                <div className="flex items-center justify-between rounded-xl border bg-primary/5 p-4">
                  <div>
                    <h4 className="font-bold text-foreground text-xs">
                      Have you studied with Prof. {teacher.lastName}?
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Submit anonymous peer advice on exams, projects, and lecture style.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsWritingReview(true)}
                    className="gap-1.5 shrink-0 shadow-xs"
                  >
                    <Sparkles className="size-3.5" /> Rate Professor
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmitReview}
                  className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Award className="size-4 text-primary" /> Submit Anonymous Rating
                    </h4>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => setIsWritingReview(false)}
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Course Dropdown Selector */}
                  <div className="space-y-1 text-xs">
                    <label className="font-medium text-foreground">
                      Course Taken
                    </label>
                    <select
                      value={selectedCourseAbbr}
                      onChange={(e) => setSelectedCourseAbbr(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      {teacher.coursesTaught.map((c) => (
                        <option key={c.courseAbbr} value={c.courseAbbr}>
                          [{c.courseAbbr}] {c.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5 Academic Metric Sliders */}
                  <div className="space-y-2.5 pt-1 text-xs">
                    {(
                      [
                        { key: "teaching", label: "Teaching Ability" },
                        { key: "punctuality", label: "Punctuality & Schedule" },
                        { key: "communication", label: "Communication & Help" },
                        { key: "knowledge", label: "Subject Knowledge" },
                        { key: "fairness", label: "Grading Fairness" },
                      ] as const
                    ).map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between border-b pb-1.5"
                      >
                        <span className="font-medium text-foreground">{label}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleScoreChange(key, star)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star
                                className={`size-4 ${
                                  star <= metricScores[key]
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-muted-foreground/30"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Title & Comment */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="font-medium text-foreground">Headline</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Focus on the semester project and Mars simulator"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-foreground">
                        Advice & Exam Tips
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Share helpful guidance for your fellow students..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  {submittedSuccess ? (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                      <CheckCircle2 className="size-4" /> Review submitted anonymously! Thank you.
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2 pt-2">
                      <Button size="sm" type="submit">
                        Publish Review
                      </Button>
                    </div>
                  )}
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {teacher.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="rounded-xl border bg-muted/15 p-4 space-y-2.5 text-xs shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">
                          {rev.title}
                        </span>
                        <span className="rounded bg-primary/10 text-primary font-mono text-[10px] px-1.5 py-0.5 font-bold">
                          {rev.courseAbbr}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`size-3.5 ${
                              s <= rev.rating ? "fill-amber-500" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-dashed text-[11px] text-muted-foreground">
                      <span>
                        By <strong className="text-foreground">{rev.studentName}</strong> ({rev.studentRole})
                      </span>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t px-6 py-3 bg-muted/20">
          <Button size="sm" variant="default" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
