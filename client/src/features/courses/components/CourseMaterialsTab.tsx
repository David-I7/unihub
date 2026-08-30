import { useState } from "react";
import { LayoutGrid, FolderTree, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardMaterialsView } from "./materials/StandardMaterialsView";
import { VSCodeMaterialsView } from "./materials/VSCodeMaterialsView";

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
  const [viewMode, setViewMode] = useState<"standard" | "vscode">(() => {
    return (
      (localStorage.getItem("course_materials_view_mode") as
        | "standard"
        | "vscode") || "standard"
    );
  });

  const handleViewModeChange = (mode: "standard" | "vscode") => {
    setViewMode(mode);
    localStorage.setItem("course_materials_view_mode", mode);
  };

  return (
    <div className="space-y-6">
      {/* Materials Toolbar with View Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-2 text-foreground font-heading font-bold text-base">
          <FolderOpen className="size-5 text-primary" />
          <span>Course Materials & Repository</span>
        </div>

        {/* View Mode Toggle Button Group */}
        <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border/50 text-xs shrink-0">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => handleViewModeChange("standard")}
            className={`gap-1.5 rounded-lg px-3 text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "standard"
                ? "bg-card text-foreground shadow-xs hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-3.5" />
            <span>Standard View</span>
          </Button>

          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => handleViewModeChange("vscode")}
            className={`gap-1.5 rounded-lg px-3 text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "vscode"
                ? "bg-card text-foreground shadow-xs hover:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderTree className="size-3.5" />
            <span>VS Code View</span>
          </Button>
        </div>
      </div>

      {/* Render Active View */}
      {viewMode === "standard" ? (
        <StandardMaterialsView
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          courseSlug={courseSlug}
        />
      ) : (
        <VSCodeMaterialsView
          communitySlug={communitySlug}
          studyYearSlug={studyYearSlug}
          courseSlug={courseSlug}
        />
      )}
    </div>
  );
}
