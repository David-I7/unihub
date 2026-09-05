import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Star,
  BookOpen,
  Info,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  X,
} from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { formatPostDate } from "@/lib/dateUtils";
import { useAuthStore } from "@/features/auth";
import { usePermissions } from "@/hooks/usePermissions";
import { useObserver } from "@/hooks/useObserver";
import {
  useTeacherDetail,
  useInfiniteTeacherRatings,
} from "../api/getTeacherDetail";
import { UpdateTeacherDialog } from "./UpdateTeacherDialog";
import { DeleteTeacherAlertDialog } from "./DeleteTeacherAlertDialog";
import { CreateReviewDialog } from "./CreateReviewDialog";
import { UpdateReviewDialog } from "./UpdateReviewDialog";
import { DeleteReviewAlertDialog } from "./DeleteReviewAlertDialog";
import type { TeacherRating, CallerMembership } from "../api/types";

interface TeacherDetailDialogProps {
  teacherId: string | null;
  communitySlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callerMembership?: CallerMembership | null;
}

export function TeacherDetailDialog({
  teacherId,
  communitySlug = "",
  open,
  onOpenChange,
  callerMembership,
}: TeacherDetailDialogProps) {
  const user = useAuthStore((state) => state.user);
  const { isOwner, communityRole, globalPermissions } =
    usePermissions(callerMembership);

  const isCommunityAdmin =
    isOwner ||
    communityRole === "COMMUNITY_ADMIN" ||
    globalPermissions.includes("ADMIN") ||
    globalPermissions.includes("ROOT") ||
    user?.role === "ADMIN" ||
    user?.role === "ROOT";

  const {
    data: teacher,
    isLoading: isTeacherLoading,
    isError,
  } = useTeacherDetail(teacherId, { enabled: open && Boolean(teacherId) });

  const {
    data: ratingsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteTeacherRatings(
    teacherId,
    { size: 10 },
    { enabled: open && Boolean(teacherId) },
  );

  const { ref: observerRef } = useObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage),
  });

  // Dialog states for mutations
  const [editTeacherOpen, setEditTeacherOpen] = useState(false);
  const [deleteTeacherOpen, setDeleteTeacherOpen] = useState(false);
  const [createReviewOpen, setCreateReviewOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<TeacherRating | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);

  const reviews = useMemo(() => {
    return ratingsData?.pages.flatMap((page) => page.content) ?? [];
  }, [ratingsData]);

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {isTeacherLoading || !teacher ? (
            <div className="p-12 text-center text-sm text-muted-foreground space-y-3">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-medium">Loading instructor details...</p>
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-sm text-destructive font-medium">
              Failed to load teacher information. Please try again.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Teacher Header Profile */}
              <div className="flex items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-border/60">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                  <UserAvatar
                    username={teacher.lastName || teacher.firstName}
                    size="lg"
                    fallbackClassName="rounded-xl sm:rounded-2xl"
                  />

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <DialogTitle className="text-lg sm:text-2xl font-bold font-heading text-foreground break-words sm:truncate">
                        Prof. {teacher.firstName} {teacher.lastName}
                      </DialogTitle>
                    </div>

                    {/* Aggregate Rating and Reviews count */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                        <Star className="size-3.5 fill-amber-500 text-amber-500" />
                        {teacher.averageRating
                          ? teacher.averageRating.toFixed(1)
                          : "0.0"}
                      </span>
                      {teacher.estimatedAge && (
                        <Badge
                          variant="outline"
                          size="xs"
                          className="font-mono text-[11px] shrink-0 block"
                        >
                          {teacher.estimatedAge} yrs old
                        </Badge>
                      )}

                      {teacher.createdAt && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">
                            Added {formatPostDate(teacher.createdAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Actions: 3-dots Menu + Close Button */}
                <div className="flex items-center gap-1 shrink-0 self-start">
                  {isCommunityAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                            title="Teacher options"
                          />
                        }
                      >
                        <MoreVertical className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => setEditTeacherOpen(true)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Edit2 className="size-3.5" />
                          <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTeacherOpen(true)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" />
                          <span>Delete Teacher</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DialogClose
                    render={
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                        title="Close dialog"
                      >
                        <X className="size-4" />
                        <span className="sr-only">Close</span>
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* 2-Tab Navigation Container (Consistent with page tabs) */}
              <Tabs defaultValue="overview" className="w-full space-y-6">
                <div className="w-full overflow-x-auto no-scrollbar">
                  <TabsList className="h-10 p-1 bg-muted/60 rounded-xl gap-1 flex-nowrap shrink-0">
                    <TabsTrigger value="overview">
                      <Info className="size-4" />
                      <span>Overview</span>
                    </TabsTrigger>

                    <TabsTrigger value="reviews">
                      <Star className="size-4 fill-foreground border-0" />
                      <span>Reviews ({teacher.ratingsCount ?? 0})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Overview (Rating Breakdown & Courses Taught) */}
                <TabsContent
                  value="overview"
                  className="space-y-6 focus-visible:outline-none"
                >
                  {/* Detailed Metric Score Bars */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span>Rating Breakdown</span>
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="size-3.5 fill-amber-500" />
                      <span>
                        {teacher.averageRating
                          ? teacher.averageRating.toFixed(1)
                          : "0.0"}{" "}
                        / 5.0
                      </span>
                    </div>
                  </div>

                  {!teacher.detailedRatings ||
                  teacher.detailedRatings.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No metric ratings recorded yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {teacher.detailedRatings.map((metric) => {
                        const percentage = Math.min(
                          100,
                          Math.max(0, (metric.averageRating / 5) * 100),
                        );
                        return (
                          <div key={metric.metricId} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-foreground">
                                {metric.metricName}
                              </span>
                              <span className="font-bold ">
                                {metric.averageRating
                                  ? metric.averageRating.toFixed(1)
                                  : "0.0"}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted/80 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 dark:bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            {metric.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1">
                                {metric.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Courses Taught Section */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span>
                        Courses Taught ({teacher.coursesTaught?.length ?? 0})
                      </span>
                    </h3>

                    {!teacher.coursesTaught ||
                    teacher.coursesTaught.length === 0 ? (
                      <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-2">
                        <BookOpen className="size-8 text-muted-foreground/40" />
                        <h4 className="text-sm font-semibold text-foreground">
                          No Courses Assigned
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          This instructor is not currently assigned to any
                          active courses in this community.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {teacher.coursesTaught.map((course) => {
                          const studyYearSlug = `year-${Math.max(
                            1,
                            Math.ceil(course.semester / 2),
                          )}`;
                          const courseHref = communitySlug
                            ? `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${course.slug}`
                            : undefined;

                          const cardContent = (
                            <Card className="rounded-xl border bg-card p-4 transition-all hover:cursor-pointer hover:border-primary/50 hover:shadow-xs space-y-1 h-full flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {course.abbreviation}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    size="xs"
                                    className="text-[10px]"
                                  >
                                    Semester {course.semester}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-bold text-foreground line-clamp-2">
                                  {course.name}
                                </h4>
                              </div>
                              <div className="text-[11px] font-medium text-primary flex items-center justify-end gap-1 pt-2 border-t border-border/50">
                                <span>View Details →</span>
                              </div>
                            </Card>
                          );

                          return courseHref ? (
                            <Link
                              key={course.id}
                              to={courseHref}
                              onClick={() => onOpenChange(false)}
                            >
                              {cardContent}
                            </Link>
                          ) : (
                            <div key={course.id}>{cardContent}</div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab 2: Reviews (Individual Reviews & Feedback) */}
                <TabsContent
                  value="reviews"
                  className="space-y-6 focus-visible:outline-none"
                >
                  {/* Reviews List Header Toolbar */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <span>Student Reviews ({reviews.length})</span>
                    </h3>

                    {user && (
                      <Button
                        size="sm"
                        onClick={() => setCreateReviewOpen(true)}
                        className="gap-1 font-semibold text-xs cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Write a Review</span>
                      </Button>
                    )}
                  </div>

                  {/* Reviews Feed */}
                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
                      <Star className="size-8 text-muted-foreground/40" />
                      <h4 className="text-sm font-semibold text-foreground">
                        No Reviews Yet
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Be the first student to leave feedback and rating for
                        Prof. {teacher.firstName} {teacher.lastName}!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => {
                        const isAuthor = Boolean(
                          user &&
                          review.author &&
                          String(user.id) === String(review.author.id),
                        );
                        const canManageReview = isAuthor || isCommunityAdmin;
                        const reviewAverageRating =
                          review.values.reduce(
                            (acc, metric) => acc + metric.value,
                            0,
                          ) / review.values.length;

                        return (
                          <Card
                            key={review.id}
                            className="rounded-2xl border bg-card p-5 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  username={
                                    review.isAnonymous
                                      ? "Anonymous"
                                      : (review.author?.username ?? "Student")
                                  }
                                  size="sm"
                                  className="size-9 rounded-xl"
                                  fallbackClassName="rounded-xl"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-foreground">
                                      {review.isAnonymous
                                        ? "Anonymous Student"
                                        : (review.author?.username ??
                                          "Student")}
                                    </span>
                                    {review.isAnonymous && (
                                      <Badge
                                        variant="secondary"
                                        size="xs"
                                        className="text-[10px]"
                                      >
                                        Anonymous
                                      </Badge>
                                    )}
                                    {isAuthor && (
                                      <span className="text-[10px] text-muted-foreground">
                                        (Your Review)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">
                                    {formatPostDate(review.createdAt)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <div className="flex items-center gap-1.5 font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                                  <Star className="size-2.5 fill-amber-500 text-amber-500" />
                                  <span className="text-xs">
                                    {reviewAverageRating.toFixed(1)}
                                  </span>
                                </div>

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
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-36"
                                    >
                                      {isAuthor && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setReviewToEdit(review)
                                          }
                                          className="gap-2 cursor-pointer text-xs"
                                        >
                                          <Edit2 className="size-3" />
                                          <span>Edit Review</span>
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() =>
                                          setReviewToDelete(review.id)
                                        }
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

                            {/* Metric score badges */}
                            {review.values && review.values.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {review.values.map((val) => (
                                  <span
                                    key={val.metricId}
                                    className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 px-2 py-0.5 rounded-md border border-border/50"
                                  >
                                    <span className="text-muted-foreground">
                                      {val.metricName}:
                                    </span>
                                    <span className="font-bold text-amber-500">
                                      {val.value}★
                                    </span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Review Headline & Body */}
                            <div className="space-y-1.5 pt-1">
                              <h4 className="font-heading text-sm font-bold text-foreground">
                                {review.title}
                              </h4>
                              {review.description && (
                                <MarkdownRenderer
                                  content={review.description}
                                />
                              )}
                            </div>
                          </Card>
                        );
                      })}

                      {/* Infinite Scroll Sentinel */}
                      {hasNextPage && (
                        <div
                          ref={observerRef}
                          className="py-2 text-center text-xs text-muted-foreground"
                        >
                          {isFetchingNextPage && "Loading more reviews..."}
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Mutation Modals */}
      <UpdateTeacherDialog
        teacher={teacher || null}
        open={editTeacherOpen}
        onOpenChange={setEditTeacherOpen}
      />

      <DeleteTeacherAlertDialog
        teacher={teacher || null}
        open={deleteTeacherOpen}
        onOpenChange={(isOpen) => {
          setDeleteTeacherOpen(isOpen);
          if (!isOpen) onOpenChange(false);
        }}
      />

      <CreateReviewDialog
        teacherId={teacher?.id || ""}
        teacherName={teacher ? `${teacher.firstName} ${teacher.lastName}` : ""}
        metrics={teacher?.detailedRatings}
        open={createReviewOpen}
        onOpenChange={setCreateReviewOpen}
      />

      <UpdateReviewDialog
        teacherId={teacher?.id || ""}
        rating={reviewToEdit}
        metrics={teacher?.detailedRatings}
        open={Boolean(reviewToEdit)}
        onOpenChange={(isOpen) => !isOpen && setReviewToEdit(null)}
      />

      <DeleteReviewAlertDialog
        teacherId={teacher?.id || ""}
        ratingId={reviewToDelete}
        open={reviewToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setReviewToDelete(null)}
      />
    </>
  );
}
