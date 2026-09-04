import * as React from "react";
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
  className?: string;
  disabled?: boolean;
}

export function SortSelect({
  field,
  dir,
  onSortChange,
  options,
  className,
  disabled = false,
}: SortSelectProps) {
  const currentValueKey = `${field}:${dir}`;
  const currentOption = options.find(
    (opt) => opt.field === field && opt.dir === dir,
  );

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
          className="rounded-xl bg-card text-xs font-normal transition-colors max-w-[220px]"
          aria-label="Sort by"
        >
          <SelectValue placeholder="Sort">
            <span className="flex items-center gap-1.5 truncate">
              <ArrowUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {currentOption ? currentOption.label : "Sort"}
              </span>
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
