import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  className,
  triggerClassName,
  disabled = false,
}: FilterSelectProps) {
  const currentOption = options.find((opt) => opt.value === value);

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
      {label && (
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
          {label}:
        </span>
      )}
      <Select
        value={value}
        onValueChange={(val: string | null) => {
          if (val !== null) onChange(val);
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "h-9 min-w-[130px] max-w-[200px] text-xs font-normal rounded-xl bg-card transition-colors truncate",
            triggerClassName,
          )}
        >
          <SelectValue placeholder={placeholder}>
            <span className="truncate">
              {currentOption ? currentOption.label : placeholder}
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
