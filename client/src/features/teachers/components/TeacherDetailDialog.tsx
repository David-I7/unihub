import { useState, useMemo } from "react";
import { Link } from "react-router";
import {
  Star,
  BookOpen,
  MoreVertical,
  Edit2,
  Trash2,
  Plus,
  GraduationCap,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
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
import { useTeacherDetail, useInfiniteTeacherRatings } from "../api/getTeacherDetail";
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
  const { isOwner, communityRole, globalPermissions } = usePermissions(callerMembership);

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
  } = useInfiniteTeacherRatings(teacherId, { size: 10 }, { enabled: open && Boolean(teacherId) });

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
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          {isTeacherLoading || !teacher ? (
            <div className="p-8 text-center text-sm text-muted-foreground space-y-2">
              <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading teacher details...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-sm text-destructive">
              Failed to load teacher information. Please try again.
            </div>
          ) : (
            <>
              {/* Teacher Header Banner */}
              <div className="border-b bg-muted/30 p-6 sm:p-7 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <UserAvatar
                      username={teacher.lastName || teacher.firstName}
                      className="size-16 rounded-2xl ring-2 ring-primary/20 text-lg font-bold"
                      fallbackClassName="rounded-2xl"
                    />

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground truncate">
                          Prof. {teacher.firstName} {teacher.lastName}
                        </DialogTitle>
                        {teacher.estimatedAge && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {teacher.estimatedAge} yrs old
                          </Badge>
                        )}
                      </div>

                      {/* Aggregate Rating and Reviews count */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Star className="size-3.5 fill-amber-500 text-amber-500" />
                          {teacher.averageRating ? teacher.averageRating.toFixed(1) : "0.0"}
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                          {teacher.ratingsCount ?? 0}{" "}
                          {teacher.ratingsCount === 1 ? "student rating" : "student ratings"}
                        </span>
                        {teacher.createdAt && (
                          <>
                            <span>•</span>
                            <span>Added {formatPostDate(teacher.createdAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header Action Menu for Community Admins */}
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
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTeacherOpen(true)}
                          className="gap-2 cursor-pointer text-xs"
                        >
                          <Trash2 className="size-3.5" />
                          Delete Teacher
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* 2-Tab Navigation Container */}
              <Tabs defaultValue="courses" className="flex-1 flex flex-col min-h-0">
                <div className="border-b px-6 bg-card">
                  <TabsList className="h-11 bg-transparent p-0 gap-4">
                    <TabsTrigger
                      value="courses"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-semibold gap-1.5"
                    >
                      <BookOpen className="size-4" />
                      <span>Courses Taught ({teacher.coursesTaught?.length ?? 0})</span>
                    </TabsTrigger>

                    <TabsTrigger
                      value="ratings"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-semibold gap-1.5"
                    >
                      <Sparkles className="size-4" />
                      <span>Ratings & Reviews ({teacher.ratingsCount ?? 0})</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab 1: Profile & Courses Taught */}
                <TabsContent
                  value="courses"
                  className="flex-1 overflow-y-auto p-6 focus-visible:outline-none space-y-6"
                >
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <GraduationCap className="size-4 text-primary" />
                      <span>Assigned Curriculum Courses</span>
                    </h3>

                    {(!teacher.coursesTaught || teacher.coursesTaught.length === 0) ? (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
                        <BookOpen className="size-8 text-muted-foreground/40" />
                        <h4 className="text-sm font-semibold text-foreground">
                          No Courses Assigned
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-sm">
                          This instructor is not currently assigned to any active courses in this community.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {teacher.coursesTaught.map((course) => {
                          const studyYearSlug = `year-${Math.max(1, Math.ceil(course.semester / 2))}`;
                          const courseHref = communitySlug
                            ? `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${course.slug}`
                            : undefined;

                          const cardContent = (
                            <Card className="rounded-xl border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xs space-y-2.5 h-full flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-mono font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                    {course.abbreviation}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                    Semester {course.semester}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-bold text-foreground line-clamp-2">
                                  {course.name}
                                </h4>
                              </div>
                              <div className="text-[11px] font-medium text-primary flex items-center gap-1 pt-2 border-t border-border/50">
                                <span>View Course Details →</span>
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

                {/* Tab 2: Metric Breakdown & Reviews */}
                <TabsContent
                  value="ratings"
                  className="flex-1 overflow-y-auto p-6 focus-visible:outline-none space-y-6"
                >
                  {/* Detailed Metric Score Bars */}
                  <Card className="rounded-2xl border bg-card p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Star className="size-3.5 text-amber-500 fill-amber-500" />
                        <span>Metric Breakdown</span>
                      </h3>
                      <span className="text-xs font-semibold text-foreground">
                        Average: {teacher.averageRating ? teacher.averageRating.toFixed(1) : "0.0"} / 5.0
                      </span>
                    </div>

                    {(!teacher.detailedRatings || teacher.detailedRatings.length === 0) ? (
                      <p className="text-xs text-muted-foreground italic">
                        No metric ratings recorded yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
                        {teacher.detailedRatings.map((metric) => {
                          const percentage = Math.min(100, Math.max(0, (metric.averageRating / 5) * 100));
                          return (
                            <div key={metric.metricId} className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-foreground">
                                  {metric.metricName}
                                </span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  {metric.averageRating ? metric.averageRating.toFixed(1) : "0.0"}
                                </span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              {metric.description && (
                                <p className="text-[10px] text-muted-foreground truncate">
                                  {metric.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  {/* Reviews List Header Toolbar */}
                  <div className="flex items-center justify-between pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-4 text-primary" />
                      <span>Student Reviews ({reviews.length})</span>
                    </h3>

                    {user && (
                      <Button
                        size="xs"
                        onClick={() => setCreateReviewOpen(true)}
                        className="gap-1 font-semibold text-xs cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        Write a Review
                      </Button>
                    )}
                  </div>

                  {/* Reviews Feed */}
                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-2">
                      <MessageSquare className="size-8 text-muted-foreground/40" />
                      <h4 className="text-sm font-semibold text-foreground">
                        No Reviews Yet
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Be the first student to leave feedback and rating for Prof. {teacher.firstName} {teacher.lastName}!
                      </p>
                      {user && (
                        <Button
                          size="xs"
                          onClick={() => setCreateReviewOpen(true)}
                          className="mt-2 font-semibold text-xs cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          Write First Review
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => {
                        const isAuthor = Boolean(
                          user && review.author && String(user.id) === String(review.author.id),
                        );
                        const canManageReview = isAuthor || isCommunityAdmin;

                        return (
                          <Card
                            key={review.id}
                            className="rounded-2xl border bg-card p-5 shadow-xs space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <UserAvatar
                                  username={
                                    review.isAnonymous
                                      ? "Anonymous"
                                      : review.author?.username ?? "Student"
                                  }
                                  className="size-9 rounded-xl"
                                  fallbackClassName="rounded-xl"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-xs text-foreground">
                                      {review.isAnonymous
                                        ? "Anonymous Student"
                                        : review.author?.username ?? "Student"}
                                    </span>
                                    {review.isAnonymous && (
                                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                        Anonymous
                                      </Badge>
                                    )}
                                    {isAuthor && (
                                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] py-0 px-1.5 font-bold">
                                        Your Review
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-muted-foreground">
                                    {formatPostDate(review.createdAt)}
                                  </span>
                                </div>
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
                                  <DropdownMenuContent align="end" className="w-36">
                                    {isAuthor && (
                                      <DropdownMenuItem
                                        onClick={() => setReviewToEdit(review)}
                                        className="gap-2 cursor-pointer text-xs"
                                      >
                                        <Edit2 className="size-3" />
                                        Edit Review
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => setReviewToDelete(review.id)}
                                      className="gap-2 cursor-pointer text-xs"
                                    >
                                      <Trash2 className="size-3" />
                                      Delete Review
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
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
                                <MarkdownRenderer content={review.description} />
                              )}
                            </div>
                          </Card>
                        );
                      })}

                      {/* Infinite Scroll Sentinel */}
                      <div ref={observerRef} className="py-2 text-center text-xs text-muted-foreground">
                        {isFetchingNextPage && "Loading more reviews..."}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
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
