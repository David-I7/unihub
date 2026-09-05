import { useState } from "react";
import { FileText, Edit2 as Edit3, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { MarkdownRenderer } from "@/components/app/MarkdownRenderer";
import { useCommunityReadme } from "../../api/getCommunityReadme";
import { CommunityReadmeTabSkeleton } from "./CommunityReadmeTabSkeleton";
import { EditCommunityReadmeModal } from "./EditCommunityReadmeModal";
import type { CallerMembership, Community } from "../../api/types";

interface CommunityReadmeTabProps {
  community: Community;
  callerMembership?: CallerMembership | null;
}

export function CommunityReadmeTab({
  community,
  callerMembership,
}: CommunityReadmeTabProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { canEditCommunity } = usePermissions(callerMembership);
  const { data, isLoading } = useCommunityReadme(community.slug);

  if (isLoading) {
    return <CommunityReadmeTabSkeleton />;
  }

  const readme = data?.readme ?? null;
  const hasReadme = Boolean(readme && readme.trim().length > 0);

  return (
    <div className="w-full space-y-4">
      {/* Dynamic Action Button (Edit Readme if exists, Create Readme if not) */}
      {canEditCommunity && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="gap-1.5 font-semibold cursor-pointer"
          >
            {hasReadme ? (
              <>
                <Edit3 className="size-3.5" />
                Edit Readme
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Create Readme
              </>
            )}
          </Button>
        </div>
      )}

      {/* Main Markdown Readme Content */}
      {hasReadme && readme ? (
        <Card className="rounded-2xl border bg-card p-6 md:p-8 shadow-xs">
          <MarkdownRenderer content={readme} />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-semibold text-foreground">
              No Readme Document Added Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              An expanded markdown document gives members an overview of study
              curriculums, resources, and guidelines.
            </p>
          </div>
        </div>
      )}

      <EditCommunityReadmeModal
        community={community}
        currentReadme={readme}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </div>
  );
}
