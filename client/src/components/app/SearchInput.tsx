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
  autoFocus?: boolean;
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
  autoFocus = false,
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
    <div className={cn("relative flex items-center w-full min-w-[160px]", className)}>
      <Search className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          "h-8 pl-8 text-xs rounded-xl bg-card transition-all",
          value || totalCount !== undefined ? "pr-20" : "pr-3",
          inputClassName,
        )}
      />
      <div className="absolute right-1.5 flex items-center gap-1">
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onChange("")}
            className="size-5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clear search"
          >
            <X className="size-3" />
          </Button>
        )}
        {countText && (
          <span className="text-[10px] font-medium text-muted-foreground px-1 hidden sm:inline-block truncate max-w-[90px]">
            {countText}
          </span>
        )}
      </div>
    </div>
  );
}

export const SearchInput = React.memo(SearchInputComponent);
