import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StudyYearsGrid,
  CreateStudyYearModal,
  type StudyYearMetrics,
} from "@/features/studyYears";
import { usePermissions } from "@/hooks/usePermissions";

import type { CallerMembership } from "../../api/types";

interface CommunityStudyYearsTabProps {
  communitySlug: string;
  studyYears: StudyYearMetrics[];
  callerMembership?: CallerMembership | null;
  onStudyYearSelect?: (studyYear: StudyYearMetrics) => void;
}

export function CommunityStudyYearsTab({
  communitySlug,
  studyYears: propStudyYears,
  callerMembership,
  onStudyYearSelect,
}: CommunityStudyYearsTabProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { canCreateStudyYear } = usePermissions(callerMembership);

  const canAddMoreYears = propStudyYears.length < 4;

  return (
    <div className="space-y-6">
      {/* Top action header if authorized */}
      {canCreateStudyYear && canAddMoreYears && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 font-bold shadow-xs cursor-pointer"
          >
            <Plus className="size-4" />
            Add Study Year
          </Button>
        </div>
      )}

      <StudyYearsGrid
        studyYears={propStudyYears}
        communitySlug={communitySlug}
        onStudyYearSelect={onStudyYearSelect}
        emptyTitle="No Study Years Available"
        emptyDescription="This community does not have any study years registered yet."
      />

      <CreateStudyYearModal
        communitySlug={communitySlug}
        existingStudyYears={propStudyYears}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}

