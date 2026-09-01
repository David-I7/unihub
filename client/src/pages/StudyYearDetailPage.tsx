import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { MoreVertical, Trash2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { usePermissions } from "@/hooks/usePermissions";
import {
  StudyYearCoursesList,
  DeleteStudyYearDialog,
  formatStudyYearName,
  slugToStudyYearEnum,
  type StudyYearMetrics,
} from "@/features/studyYears";

export default function StudyYearDetailPage() {
  const { communitySlug = "", studyYearSlug = "" } = useParams<{
    communitySlug: string;
    studyYearSlug: string;
  }>();

  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { canDeleteStudyYear } = usePermissions(communitySlug);

  const title = formatStudyYearName(studyYearSlug);
  const studyYearEnum = slugToStudyYearEnum(studyYearSlug);

  const studyYearMetrics: StudyYearMetrics = {
    id: 0,
    studyYearName: studyYearEnum,
    createdAt: new Date().toISOString(),
    coursesCount: 0,
    archivedCoursesCount: 0,
    creditsCount: 0,
  };

  const handleStudyYearDeleted = () => {
    navigate(`/communities/${communitySlug}?tab=study-years`);
  };

  return (
    <div className="min-h-full space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
          {title} <span>Courses</span>
        </h1>

        {canDeleteStudyYear && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-9 rounded-xl hover:bg-muted cursor-pointer"
                  title="Study year options"
                >
                  <MoreVertical className="size-4 text-foreground" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="gap-2 cursor-pointer text-xs"
              >
                <Trash2 className="size-3.5" />
                <span>Delete Study Year</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AppBreadcrumb />

      {/* Courses List with Dropdown Filter, Search, and Infinite Scroll */}
      <StudyYearCoursesList
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
      />

      <DeleteStudyYearDialog
        communitySlug={communitySlug}
        studyYear={studyYearMetrics}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={handleStudyYearDeleted}
      />
    </div>
  );
}
