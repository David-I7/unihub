import { StandardMaterialsView } from "./materials/StandardMaterialsView";

interface CourseMaterialsTabProps {
  communitySlug: string;
  studyYearSlug: string;
  courseSlug: string;
}

export function CourseMaterialsTab({
  communitySlug,
  studyYearSlug,
  courseSlug,
}: CourseMaterialsTabProps) {
  return (
    <div className="space-y-6">
      <StandardMaterialsView
        communitySlug={communitySlug}
        studyYearSlug={studyYearSlug}
        courseSlug={courseSlug}
      />
    </div>
  );
}
