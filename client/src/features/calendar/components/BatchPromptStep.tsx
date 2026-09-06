import { useState, useMemo } from "react";
import { Check, Copy } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { formatStudyYearName } from "@/features/studyYears";
import {
  generateSchedulePrompt,
  type PromptCourseItem,
} from "../utils/schedulePromptGenerator";
import { toast } from "sonner";

interface BatchPromptStepProps {
  selectedStudyYear: string;
  onSelectStudyYear: (year: string) => void;
  studyYears?: { id: number; studyYearName: string }[];
  communityName: string;
  courses: PromptCourseItem[];
  isLoadingCourses: boolean;
}

export function BatchPromptStep({
  selectedStudyYear,
  onSelectStudyYear,
  studyYears,
  communityName,
  courses,
  isLoadingCourses,
}: BatchPromptStepProps) {
  const [isCopied, setIsCopied] = useState(false);

  const generatedPrompt = useMemo(() => {
    const displayName = formatStudyYearName(selectedStudyYear);
    return generateSchedulePrompt({
      communityName,
      studyYearDisplayName: displayName,
      courses,
    });
  }, [selectedStudyYear, communityName, courses]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setIsCopied(true);
      toast.success("Prompt copied to clipboard");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Failed to copy prompt to clipboard");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold text-foreground">
              Target Study Year
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Select which year this schedule or exam timetable applies to.
            </p>
          </div>
          <Select
            value={selectedStudyYear}
            onValueChange={(val) => onSelectStudyYear(val ?? "")}
          >
            <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs bg-background shrink-0">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {studyYears?.map((sy) => (
                <SelectItem key={sy.id} value={sy.studyYearName}>
                  {formatStudyYearName(sy.studyYearName)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span>
            Community:{" "}
            <strong className="text-foreground">{communityName}</strong>
          </span>
          <span>
            Courses mapped:{" "}
            {isLoadingCourses ? (
              <span className="inline-flex items-center gap-1">
                <Spinner className="size-3" /> loading...
              </span>
            ) : (
              <strong className="text-foreground">
                {courses.length} courses
              </strong>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            Generated Prompt for LLM
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyPrompt}
            className="gap-1.5 h-8 text-xs font-medium cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="size-3.5 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Prompt</span>
              </>
            )}
          </Button>
        </div>
        <div className="relative rounded-xl border bg-muted/30 p-3 max-h-[260px] overflow-y-auto font-mono text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {generatedPrompt}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Give this prompt together with your PDF or document text to any LLM
          (e.g. Gemini, ChatGPT, Claude) to extract the schedule.
        </p>
      </div>
    </div>
  );
}
