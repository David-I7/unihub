import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { StarRatingInput } from "./StarRatingInput";
import { useUpdateTeacherRating } from "../api/updateTeacherRating";
import type { TeacherMetricRating, TeacherRating } from "../api/types";

const FALLBACK_METRICS = [
  {
    metricId: 1,
    metricName: "Teaching ability",
    description: "Effectiveness in explaining concepts and engaging students",
  },
  {
    metricId: 2,
    metricName: "Punctuality",
    description: "Punctual schedule adherence and timely responsiveness",
  },
  {
    metricId: 3,
    metricName: "Communication",
    description: "Clear and accessible communication with students",
  },
  {
    metricId: 4,
    metricName: "Knowledge",
    description: "Deep understanding and mastery of the course material",
  },
  {
    metricId: 5,
    metricName: "Fairness",
    description: "Impartial grading and fair treatment of all students",
  },
];

interface UpdateReviewDialogProps {
  teacherId: string;
  rating: TeacherRating | null;
  metrics?: TeacherMetricRating[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (updated: TeacherRating) => void;
}

function UpdateReviewForm({
  teacherId,
  rating,
  metrics = [],
  onClose,
  onSuccess,
}: {
  teacherId: string;
  rating: TeacherRating;
  metrics?: TeacherMetricRating[];
  onClose: () => void;
  onSuccess?: (updated: TeacherRating) => void;
}) {
  const activeMetrics = metrics.length > 0 ? metrics : FALLBACK_METRICS;
  const updateMutation = useUpdateTeacherRating(teacherId, rating.id);

  const [title, setTitle] = useState(rating.title || "");
  const [description, setDescription] = useState(rating.description || "");
  const [isAnonymous, setIsAnonymous] = useState(rating.isAnonymous || false);
  const [metricValues, setMetricValues] = useState<Record<number, number>>(
    () => {
      const initial: Record<number, number> = {};
      activeMetrics.forEach((m) => {
        const existing = rating.values?.find((v) => v.metricId === m.metricId);
        initial[m.metricId] = existing ? existing.value : 5;
      });
      return initial;
    },
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleMetricChange = (metricId: number, value: number) => {
    setMetricValues((prev) => ({ ...prev, [metricId]: value }));
    setErrors((prev) => ({ ...prev, [`metric_${metricId}`]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const nextErrors: Record<string, string> = {};
    if (!title.trim()) {
      nextErrors.title = "Review headline is required";
    } else if (title.trim().length < 3) {
      nextErrors.title = "Headline must be at least 3 characters";
    } else if (title.trim().length > 100) {
      nextErrors.title = "Headline must be under 100 characters";
    }

    if (description.trim().length > 500) {
      nextErrors.description = "Review details must be under 500 characters";
    }

    activeMetrics.forEach((m) => {
      const val = metricValues[m.metricId];
      if (!val || val < 1 || val > 5) {
        nextErrors[`metric_${m.metricId}`] = `Please rate ${m.metricName}`;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const payloadValues = activeMetrics.map((m) => ({
        metricId: m.metricId,
        value: metricValues[m.metricId] || 5,
      }));

      const updated = await updateMutation.mutateAsync({
        ratingId: rating.id,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          isAnonymous,
          values: payloadValues,
        },
      });

      toast.success("Review updated successfully!");
      onSuccess?.(updated);
      onClose();
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to update review.");
      toast.error(message);
      setServerError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {serverError}
        </div>
      )}

      {/* Review Title */}
      <Field>
        <FieldLabel htmlFor="editReviewTitle">Title *</FieldLabel>
        <Input
          id="editReviewTitle"
          placeholder="e.g. Excellent lectures, very supportive during office hours"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setErrors((prev) => ({ ...prev, title: "" }));
          }}
          aria-invalid={Boolean(errors.title)}
          maxLength={100}
        />
        {errors.title && <FieldError errors={[{ message: errors.title }]} />}
      </Field>

      {/* Detailed Written Feedback */}
      <Field>
        <FieldLabel htmlFor="editReviewDescription">Body (Optional)</FieldLabel>
        <Textarea
          id="editReviewDescription"
          placeholder="Share your detailed experience regarding exams, workload, and course materials (Markdown supported)..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Be constructive and respectful.</span>
          <span>{description.length} / 500</span>
        </div>
      </Field>

      {/* Anonymous Posting Toggle */}
      <div className="flex items-center justify-between rounded-xl">
        <div className="space-y-0.5">
          <FieldLabel htmlFor="editAnonymousSwitch" className="cursor-pointer">
            Post Anonymously
          </FieldLabel>
          <FieldDescription>
            Hide your username and avatar from other students on this review.
          </FieldDescription>
        </div>
        <Switch
          id="editAnonymousSwitch"
          checked={isAnonymous}
          onCheckedChange={setIsAnonymous}
        />
      </div>

      {/* Detailed Ratings Section */}

      <h4 className="font-semibold">Performance Metrics Breakdown</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeMetrics.map((metric) => (
          <div
            key={metric.metricId}
            className="rounded-xl border border-border/60 bg-card p-3 space-y-1.5"
          >
            <StarRatingInput
              label={metric.metricName}
              description={metric.description}
              value={metricValues[metric.metricId] || 0}
              onChange={(val) => handleMetricChange(metric.metricId, val)}
              size="sm"
            />
            {errors[`metric_${metric.metricId}`] && (
              <p className="text-xs text-destructive font-medium">
                {errors[`metric_${metric.metricId}`]}
              </p>
            )}
          </div>
        ))}
      </div>

      <DialogFooter className="pt-2 border-t border-border/60">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UpdateReviewDialog({
  teacherId,
  rating,
  metrics,
  open,
  onOpenChange,
  onSuccess,
}: UpdateReviewDialogProps) {
  const [cachedRating, setCachedRating] = useState<TeacherRating | null>(
    rating,
  );
  if (rating && rating !== cachedRating) {
    setCachedRating(rating);
  }
  const currentRating = rating ?? cachedRating;

  if (!currentRating) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
          <DialogDescription>
            Update your rating scores and feedback.
          </DialogDescription>
        </DialogHeader>

        <UpdateReviewForm
          key={currentRating.id}
          teacherId={teacherId}
          rating={currentRating}
          metrics={metrics}
          onClose={() => onOpenChange(false)}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
