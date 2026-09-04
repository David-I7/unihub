import { ArrowUpDown } from "@/components/ui/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SortOption {
  field: string;
  dir: "asc" | "desc";
  label: string;
}

export interface SortSelectProps {
  field: string;
  dir: "asc" | "desc";
  onSortChange: (field: string, dir: "asc" | "desc") => void;
  options: SortOption[];
  placeholder?: string;
  defaultField?: string;
  defaultDir?: "asc" | "desc";
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function SortSelect({
  field,
  dir,
  onSortChange,
  options,
  placeholder = "Sort by",
  defaultField,
  defaultDir,
  className,
  triggerClassName,
  disabled = false,
}: SortSelectProps) {
  const currentValueKey = `${field}:${dir}`;
  const currentOption = options.find(
    (opt) => opt.field === field && opt.dir === dir,
  );

  const isSorted =
    defaultField !== undefined && defaultDir !== undefined
      ? field !== defaultField || dir !== defaultDir
      : Boolean(field) && field !== "" && Boolean(currentOption);

  const displayText = currentOption ? currentOption.label : placeholder;

  const handleValueChange = (val: string | null) => {
    if (!val) return;
    const [nextField, nextDir] = val.split(":") as [string, "asc" | "desc"];
    onSortChange(nextField, nextDir);
  };

  return (
    <div className={cn("inline-flex items-center shrink-0", className)}>
      <Select
        value={currentValueKey}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          size="sm"
          className={cn(
            "rounded-xl text-xs font-normal transition-colors max-w-[220px]",
            isSorted
              ? "border-border bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80"
              : "bg-card text-foreground hover:bg-muted",
            triggerClassName,
          )}
          aria-label={placeholder}
        >
          <SelectValue placeholder={placeholder}>
            <span className="flex items-center gap-1.5 truncate">
              <ArrowUpDown
                className={cn(
                  "size-3.5 shrink-0",
                  isSorted
                    ? "text-secondary-foreground"
                    : "text-muted-foreground",
                )}
              />
              <span className="truncate">{displayText}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((opt) => {
            const key = `${opt.field}:${opt.dir}`;
            return (
              <SelectItem key={key} value={key} className="text-xs">
                <span className="truncate">{opt.label}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
