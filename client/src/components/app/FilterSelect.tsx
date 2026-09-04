import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  defaultValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select filter",
  defaultValue,
  icon: IconComponent = Filter,
  className,
  triggerClassName,
  disabled = false,
}: FilterSelectProps) {
  const currentOption = options.find((opt) => opt.value === value);

  // Check if non-default option is selected
  const isFiltered =
    defaultValue !== undefined
      ? value !== defaultValue
      : value !== "" && value !== "ALL" && value !== "all";

  const displayValue = currentOption ? currentOption.label : placeholder;
  const displayText = label ? `${label}: ${displayValue}` : displayValue;

  return (
    <div className={cn("inline-flex items-center shrink-0", className)}>
      <Select
        value={value}
        onValueChange={(val: string | null) => {
          if (val !== null) onChange(val);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          size="sm"
          className={cn(
            "rounded-xl text-xs font-normal transition-colors min-w-[110px] max-w-[220px]",
            isFiltered
              ? "border-border bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80"
              : "bg-card text-foreground hover:bg-muted",
            triggerClassName,
          )}
          aria-label={label ?? placeholder}
        >
          <SelectValue placeholder={placeholder}>
            <span className="flex items-center gap-1.5 truncate">
              {IconComponent && (
                <IconComponent
                  className={cn(
                    "size-3.5 shrink-0",
                    isFiltered
                      ? "text-secondary-foreground"
                      : "text-muted-foreground",
                  )}
                />
              )}
              <span className="truncate">{displayText}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs">
              <span className="truncate max-w-[240px] block">{opt.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
