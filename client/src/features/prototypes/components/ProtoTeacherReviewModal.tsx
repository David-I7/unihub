import { useState } from "react";
import {
  X,
  Star,
  Award,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MOCK_RATING_METRICS,
  type MockTeacher,
} from "../data/mockAcademicData";

interface ProtoTeacherReviewModalProps {
  teacher: MockTeacher | null;
  onClose: () => void;
}

export function ProtoTeacherReviewModal({
  teacher,
  onClose,
}: ProtoTeacherReviewModalProps) {
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewDescription, setReviewDescription] = useState("");
  const [metricScores, setMetricScores] = useState<Record<number, number>>({
    1: 5,
    2: 5,
    3: 5,
    4: 5,
    5: 5,
  });
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!teacher) return null;

  const handleScoreChange = (metricId: number, score: number) => {
    setMetricScores((prev) => ({ ...prev, [metricId]: score }));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSuccess(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      setSubmittedSuccess(false);
      setReviewTitle("");
      setReviewDescription("");
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">
                {teacher.firstName} {teacher.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {teacher.department || "Facultatea de Matematica si Informatica"}
              </p>
            </div>
          </div>

          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Overall Rating & Breakdown Card */}
          <div className="rounded-xl border bg-muted/20 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="text-center sm:border-r pr-2">
              <div className="text-4xl font-extrabold text-primary font-heading">
                {teacher.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mt-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s <= Math.round(teacher.averageRating)
                        ? "fill-amber-500 text-amber-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {teacher.ratingsCount} verified reviews
              </p>
            </div>

            {/* 5 DB Metrics Breakdown */}
            <div className="sm:col-span-2 space-y-2">
              {MOCK_RATING_METRICS.map((metric) => {
                const simulatedVal = (teacher.averageRating * (0.9 + (metric.id % 3) * 0.05)).toFixed(1);
                const percent = (Math.min(5, parseFloat(simulatedVal)) / 5) * 100;
                return (
                  <div key={metric.id} className="space-y-0.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">{metric.name}</span>
                      <span className="text-primary font-semibold">{simulatedVal} / 5.0</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to Leave Review / Write Review Form */}
          {!isSubmittingReview ? (
            <div className="flex items-center justify-between rounded-xl border bg-primary/5 p-4">
              <div className="text-xs">
                <p className="font-semibold text-foreground">Have you taken a course with Prof. {teacher.lastName}?</p>
                <p className="text-muted-foreground">Share anonymous, constructive advice to help future students succeed.</p>
              </div>
              <Button size="sm" onClick={() => setIsSubmittingReview(true)} className="gap-1.5 shrink-0">
                <Sparkles className="size-3.5" /> Rate Professor
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="rounded-xl border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Award className="size-4 text-primary" /> Rate against 5 Academic Metrics
                </h4>
                <Button size="xs" variant="ghost" onClick={() => setIsSubmittingReview(false)}>
                  Cancel
                </Button>
              </div>

              {/* 5 Rating Sliders/Stars */}
              <div className="space-y-3 pt-1">
                {MOCK_RATING_METRICS.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between border-b pb-2 text-xs">
                    <div>
                      <p className="font-medium text-foreground">{metric.name}</p>
                      <p className="text-[11px] text-muted-foreground">{metric.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleScoreChange(metric.id, star)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`size-4 ${
                              star <= metricScores[metric.id]
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

              {/* Title & Review Text */}
              <div className="space-y-2 text-xs">
                <label className="font-medium text-foreground">Review Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Great exam tips, focus on laboratory assignments"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                />

                <label className="font-medium text-foreground pt-1 block">Course Advice & Exam Tips</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain grading style, lecture clarity, or exam tricks..."
                  value={reviewDescription}
                  onChange={(e) => setReviewDescription(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {submittedSuccess ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="size-4" /> Review submitted anonymously! Thanks for helping peers.
                </div>
              ) : (
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" type="submit">
                    Publish Anonymous Review
                  </Button>
                </div>
              )}
            </form>
          )}

          {/* Student Reviews Feed */}
          <div className="space-y-3">
            <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" /> Verified Student Reviews ({teacher.ratings?.length || 0})
            </h4>

            {teacher.ratings && teacher.ratings.length > 0 ? (
              teacher.ratings.map((rating) => (
                <div key={rating.id} className="rounded-xl border bg-muted/10 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{rating.title}</span>
                      <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold">
                        Verified Student
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(rating.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed">
                    "{rating.description}"
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 border-t border-dashed mt-2">
                    {rating.metricValues.map((mv) => (
                      <span
                        key={mv.ratingMetricId}
                        className="rounded-md bg-background px-2 py-0.5 text-[10px] text-foreground border"
                      >
                        {mv.metricName}: <strong className="text-primary">{mv.value}/5</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No individual reviews posted yet for this semester. Be the first to add one!
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-3 bg-muted/20">
          <Button size="sm" variant="default" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
