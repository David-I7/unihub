import * as React from "react";
import { Search, X } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
  resultLabel?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

function SearchInputComponent({
  value,
  onChange,
  placeholder = "Search...",
  totalCount,
  resultLabel,
  className,
  inputClassName,
  disabled = false,
}: SearchInputProps) {
  const countText =
    totalCount !== undefined
      ? `${totalCount} ${
          resultLabel
            ? resultLabel
            : totalCount === 1
              ? "result"
              : "results"
        }`
      : null;

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "pl-10 h-10 text-xs sm:text-sm rounded-xl bg-card transition-colors",
          value || totalCount !== undefined ? "pr-24" : "pr-4",
          inputClassName,
        )}
      />
      <div className="absolute right-2 flex items-center gap-1.5">
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onChange("")}
            className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
        {countText && (
          <span className="text-[11px] font-semibold text-muted-foreground px-1.5 hidden sm:inline-block truncate max-w-[100px]">
            {countText}
          </span>
        )}
      </div>
    </div>
  );
}

export const SearchInput = React.memo(SearchInputComponent);
