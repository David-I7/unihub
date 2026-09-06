import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BatchPasteStepProps {
  value: string;
  onChange: (value: string) => void;
  validationError: string | null;
  onClearError: () => void;
}

export function BatchPasteStep({
  value,
  onChange,
  validationError,
  onClearError,
}: BatchPasteStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-foreground">
            Paste LLM Output (JSON)
          </Label>
          <span className="text-[11px] text-muted-foreground">
            Accepts raw JSON array [ ... ]
          </span>
        </div>
        <Textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (validationError) onClearError();
          }}
          placeholder='[\n  {\n    "courseId": 1,\n    "title": "Curs: Geometrie și algebră liniară",\n    "type": "LECTURE",\n    "startTime": "2026-09-08T10:00:00+03:00",\n    "durationHours": 5,\n    "location": "ONLINE",\n    "locationDetails": null\n  }\n]'
          className="font-mono text-xs min-h-[280px] leading-relaxed resize-y bg-background"
        />
      </div>

      {validationError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          <div className="flex-1 font-medium">{validationError}</div>
        </div>
      )}
    </div>
  );
}
