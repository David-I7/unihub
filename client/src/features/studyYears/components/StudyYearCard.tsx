import { useState } from "react";
import { ArrowRight, Archive, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { formatStudyYearName, type StudyYearMetrics } from "../api/types";
import { DeleteStudyYearDialog } from "./DeleteStudyYearDialog";

interface StudyYearCardProps {
  studyYear: StudyYearMetrics;
  communitySlug?: string;
  onClick?: () => void;
  onDeleted?: () => void;
}

export function StudyYearCard({
  studyYear,
  communitySlug,
  onClick,
  onDeleted,
}: StudyYearCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { canDeleteStudyYear } = usePermissions(communitySlug);

  const displayName = formatStudyYearName(studyYear.studyYearName);
  const yearNumber = displayName.replace(/\D/g, "") || "1";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Card
        onClick={onClick}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 shadow-xs transition-all hover:border-primary/60 hover:shadow-md cursor-pointer space-y-4"
      >
        {/* Header: Year number block, Title, and Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-heading font-extrabold text-base group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
              {yearNumber}
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground">Academic Curriculum</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {canDeleteStudyYear && communitySlug && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDeleteClick}
                title="Delete this study year"
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors z-10"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}

            <div className="flex size-8 items-center justify-center rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-all">
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-border">
          <div className="rounded-xl bg-muted/40 px-3 py-2 text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Courses
            </span>
            <span className="font-heading text-sm font-bold text-foreground flex items-center justify-center gap-1.5 mt-0.5">
              {studyYear.coursesCount}
            </span>
          </div>

          <div className="rounded-xl bg-muted/40 px-3 py-2 text-center">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Credits
            </span>
            <span className="font-heading text-sm font-bold text-foreground flex items-center justify-center gap-1.5 mt-0.5">
              {studyYear.creditsCount} ECTS
            </span>
          </div>
        </div>

        {studyYear.archivedCoursesCount > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <Archive className="size-3.5 text-amber-500" />
            <span>{studyYear.archivedCoursesCount} archived courses</span>
          </div>
        )}
      </Card>

      {communitySlug && (
        <DeleteStudyYearDialog
          communitySlug={communitySlug}
          studyYear={studyYear}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}

