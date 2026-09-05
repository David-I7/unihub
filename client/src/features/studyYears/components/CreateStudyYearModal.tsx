import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import {
  STUDY_YEAR_OPTIONS,
  type StudyYearSlug,
  type StudyYearMetrics,
  formatStudyYearName,
  studyYearNameToSlug,
} from "../api/types";
import { useCreateStudyYear } from "../api/createStudyYear";

interface CreateStudyYearModalProps {
  communitySlug: string;
  existingStudyYears?: StudyYearMetrics[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStudyYearModal({
  communitySlug,
  existingStudyYears = [],
  open,
  onOpenChange,
}: CreateStudyYearModalProps) {
  const existingSlugs = new Set(
    existingStudyYears.map((y) => studyYearNameToSlug(y.studyYearName)),
  );

  const availableOptions = STUDY_YEAR_OPTIONS.filter(
    (opt) => !existingSlugs.has(opt.value),
  );

  const [selectedYear, setSelectedYear] = useState<StudyYearSlug>(
    availableOptions[0]?.value ?? "year-1",
  );

  const createMutation = useCreateStudyYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        communitySlug,
        payload: {
          studyYearName: selectedYear,
        },
      });

      toast.success(
        `${formatStudyYearName(selectedYear)} created successfully!`,
      );
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to create study year."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Academic Study Year</DialogTitle>
          <DialogDescription>
            Register a new curriculum study year level for this community.
          </DialogDescription>
        </DialogHeader>

        {availableOptions.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            All 4 academic study years (Year 1 to Year 4) are already created
            for this community.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Field>
              <FieldLabel>Select Academic Level</FieldLabel>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {STUDY_YEAR_OPTIONS.map((opt) => {
                  const alreadyExists = existingSlugs.has(opt.value);
                  const isSelected = selectedYear === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={alreadyExists}
                      onClick={() => setSelectedYear(opt.value)}
                      className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all cursor-pointer ${
                        alreadyExists
                          ? "opacity-40 bg-muted/30 border-dashed border-border cursor-not-allowed"
                          : isSelected
                            ? "border-border/80 bg-secondary text-secondary-foreground shadow-xs"
                            : "border-border bg-card hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <span className="text-md font-semibold">{opt.label}</span>
                      {alreadyExists && (
                        <span className="text-[10px] text-muted-foreground pt-0.5">
                          Already Added
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <FieldDescription className="text-xs text-muted-foreground">
                Once added, members can begin registering courses and course
                offerings under this study year.
              </FieldDescription>
            </Field>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createMutation.isPending || availableOptions.length === 0
                }
              >
                {createMutation.isPending ? "Adding..." : "Add Study Year"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
