import { StandardMaterialsView } from "./materials/StandardMaterialsView";

interface CourseMaterialsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
  isArchived?: boolean;
}

export function CourseMaterialsTab({
  communitySlug,
  studyYearSlug,
  courseSlug,
  isArchived = false,
}: CourseMaterialsTabProps) {
  return (
    <div className="space-y-6">
      <StandardMaterialsView
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
        courseSlug={courseSlug}
        isArchived={isArchived}
      />
    </div>
  );
}
