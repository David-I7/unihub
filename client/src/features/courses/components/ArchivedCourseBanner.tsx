import { toast } from "sonner";
import { Archive, ArchiveRestore } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/api/types";
import { usePermissions } from "@/hooks/usePermissions";
import { useArchiveCourse } from "../api/archiveCourse";
import type { Course } from "../api/types";

interface ArchivedCourseBannerProps {
  communitySlug: string;
  studyYearSlug: string;
  course: Course;
}

export function ArchivedCourseBanner({
  communitySlug,
  studyYearSlug,
  course,
}: ArchivedCourseBannerProps) {
  const { canArchiveCourse } = usePermissions(communitySlug);
  const archiveMutation = useArchiveCourse();

  if (!course.archived) {
    return null;
  }

  const handleUnarchive = async () => {
    try {
      await archiveMutation.mutateAsync({
        communitySlug,
        studyYearSlug,
        courseSlug: course.slug,
        archived: false,
      });
      toast.success(`Course "${course.name}" has been unarchived.`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to unarchive course."));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 mt-0.5">
          <Archive className="size-4.5" />
        </div>
        <div className="space-y-0.5 min-w-0">
          <h3 className="font-heading text-sm font-bold leading-snug">
            This course is archived
          </h3>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            This course is preserved in read-only mode. Content updates, new materials, and discussions are disabled.
          </p>
        </div>
      </div>

      {canArchiveCourse && (
        <div className="shrink-0 pl-12 sm:pl-0">
          <Button
            size="sm"
            variant="outline"
            disabled={archiveMutation.isPending}
            onClick={handleUnarchive}
            className="gap-1.5 font-bold border-amber-500/40 hover:bg-amber-500/20 text-amber-950 dark:text-amber-100 cursor-pointer text-xs"
          >
            <ArchiveRestore className="size-3.5" />
            <span>
              {archiveMutation.isPending ? "Unarchiving..." : "Unarchive Course"}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
