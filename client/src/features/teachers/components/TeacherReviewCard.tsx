import {
  Star,
  ChevronDown,
  MoreVertical,
  Edit2,
  Trash2,
} from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatPostDate } from "@/lib/dateUtils";
import type { TeacherRating } from "../api/types";

interface TeacherReviewCardProps {
  review: TeacherRating;
  isAuthor: boolean;
  canManageReview: boolean;
  onEdit: (review: TeacherRating) => void;
  onDelete: (reviewId: number) => void;
}

export function TeacherReviewCard({
  review,
  isAuthor,
  canManageReview,
  onEdit,
  onDelete,
}: TeacherReviewCardProps) {
  const reviewAverageRating =
    review.values && review.values.length > 0
      ? review.values.reduce((acc, metric) => acc + metric.value, 0) /
        review.values.length
      : 0;

  const authorName = review.isAnonymous
    ? "Anonymous Student"
    : (review.author?.username ?? "Student");

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Author information */}
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar
            username={
              review.isAnonymous
                ? "Anonymous"
                : (review.author?.username ?? "Student")
            }
            size="sm"
            className="size-9 rounded-xl shrink-0"
            fallbackClassName="rounded-xl"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-xs text-foreground truncate">
                {authorName}
              </span>
              {review.isAnonymous && (
                <Badge variant="secondary" size="xs" className="text-[10px]">
                  Anonymous
                </Badge>
              )}
              {isAuthor && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  (Your Review)
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              {formatPostDate(review.createdAt)}
            </span>
          </div>
        </div>

        {/* Rating and review actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Rating breakdown pill */}
          <Popover>
            <PopoverTrigger
              className="group inline-flex items-center gap-1.5 font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/15 transition-colors px-2.5 py-1 rounded-full border border-amber-500/20 cursor-pointer text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring select-none"
              aria-label="View rating breakdown"
            >
              <Star className="size-3 fill-amber-500 text-amber-500 shrink-0" />
              <span>{reviewAverageRating.toFixed(1)}</span>
              <ChevronDown className="size-3 text-amber-500/80 shrink-0 transition-transform group-data-[popup-open]:rotate-180" />
            </PopoverTrigger>

            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={6}
              className="w-64 p-3 rounded-xl shadow-lg border border-border bg-card text-card-foreground space-y-2.5"
            >
              <div className="flex items-center justify-between border-b pb-1.5 border-border/60">
                <span className="text-xs font-semibold text-foreground">
                  Rating breakdown
                </span>
                <div className="flex items-center gap-1 font-bold text-xs text-amber-500">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <span>{reviewAverageRating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              {review.values && review.values.length > 0 ? (
                <div className="space-y-1.5">
                  {review.values.map((val) => (
                    <div
                      key={val.metricId}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-muted-foreground truncate">
                        {val.metricName}
                      </span>
                      <div className="flex items-center gap-1 font-semibold text-amber-500 shrink-0">
                        <Star className="size-2.5 fill-amber-500 text-amber-500" />
                        <span>{val.value.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No detailed ratings provided.
                </p>
              )}
            </PopoverContent>
          </Popover>

          {/* Review management options */}
          {canManageReview && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  />
                }
              >
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                {isAuthor && (
                  <DropdownMenuItem
                    onClick={() => onEdit(review)}
                    className="gap-2 cursor-pointer text-xs"
                  >
                    <Edit2 className="size-3" />
                    <span>Edit Review</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(review.id)}
                  className="gap-2 cursor-pointer text-xs"
                >
                  <Trash2 className="size-3" />
                  <span>Delete Review</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Review headline and content */}
      <div className="space-y-2">
        {review.title && (
          <h4 className="font-heading text-sm font-bold text-foreground leading-snug">
            {review.title}
          </h4>
        )}
        {review.description && (
          <MarkdownRenderer content={review.description} />
        )}
      </div>
    </Card>
  );
}
