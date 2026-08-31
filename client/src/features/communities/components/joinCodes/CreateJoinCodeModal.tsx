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
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { getErrorMessage } from "@/api/types";
import { useCreateJoinCode } from "../../api/joinCodes";

interface CreateJoinCodeModalProps {
  communitySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DURATION_PRESETS = [
  { label: "24 Hours", hours: 24 },
  { label: "7 Days", hours: 168 },
  { label: "30 Days", hours: 720 },
  { label: "Unlimited", hours: null },
];

const USES_PRESETS = [
  { label: "1 Use", uses: 1 },
  { label: "10 Uses", uses: 10 },
  { label: "50 Uses", uses: 50 },
  { label: "100 Uses", uses: 100 },
  { label: "Unlimited", uses: null },
];

export function CreateJoinCodeModal({
  communitySlug,
  open,
  onOpenChange,
}: CreateJoinCodeModalProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(168);
  const [customHours, setCustomHours] = useState("");
  const [selectedUses, setSelectedUses] = useState<number | null>(null);
  const [customUses, setCustomUses] = useState("");
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [isCustomUses, setIsCustomUses] = useState(false);

  const createMutation = useCreateJoinCode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validForHours = isCustomDuration
      ? customHours
        ? parseInt(customHours, 10)
        : undefined
      : (selectedDuration ?? undefined);

    const maxUses = isCustomUses
      ? customUses
        ? parseInt(customUses, 10)
        : undefined
      : (selectedUses ?? undefined);

    try {
      const code = await createMutation.mutateAsync({
        communitySlug,
        payload: {
          validForHours,
          maxUses,
        },
      });

      toast.success(`Join code ${code.code} generated successfully!`);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to generate join code."));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Invitation Code</DialogTitle>
          <DialogDescription>
            The code is automatically deleted when it expired or reaches its
            usage limit. You can also revoke it manually at any time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Duration Presets */}
          <Field>
            <FieldLabel>Validity Duration</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {DURATION_PRESETS.map((preset) => {
                const isSelected =
                  !isCustomDuration && selectedDuration === preset.hours;
                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={() => {
                      setIsCustomDuration(false);
                      setSelectedDuration(preset.hours);
                    }}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant={isCustomDuration ? "secondary" : "ghost"}
                size="xs"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsCustomDuration(!isCustomDuration)}
              >
                {isCustomDuration ? "Use presets" : "+ Custom duration (hours)"}
              </Button>
              {isCustomDuration && (
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter hours (e.g. 48)"
                  value={customHours}
                  onChange={(e) => setCustomHours(e.target.value)}
                  className="mt-2 text-xs"
                />
              )}
            </div>
          </Field>

          {/* Uses Presets */}
          <Field>
            <FieldLabel>Maximum Uses Limit</FieldLabel>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
              {USES_PRESETS.map((preset) => {
                const isSelected =
                  !isCustomUses && selectedUses === preset.uses;
                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="text-xs font-semibold px-2"
                    onClick={() => {
                      setIsCustomUses(false);
                      setSelectedUses(preset.uses);
                    }}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <div className="pt-2">
              <Button
                type="button"
                variant={isCustomUses ? "secondary" : "ghost"}
                size="xs"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setIsCustomUses(!isCustomUses)}
              >
                {isCustomUses ? "Use presets" : "+ Custom max uses"}
              </Button>
              {isCustomUses && (
                <Input
                  type="number"
                  min={1}
                  placeholder="Enter max uses (e.g. 25)"
                  value={customUses}
                  onChange={(e) => setCustomUses(e.target.value)}
                  className="mt-2 text-xs"
                />
              )}
            </div>
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
              disabled={createMutation.isPending}
              className="gap-2 font-bold cursor-pointer"
            >
              {createMutation.isPending ? "Generating..." : "Generate Code"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
