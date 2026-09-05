import * as React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/app/SearchInput";
import { cn } from "@/lib/utils";

export interface ExpandableSearchRenderProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  trigger: React.ReactNode;
  isCompact: boolean;
}

export interface ExpandableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
  resultLabel?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  desktopMaxWidth?: string;
  triggerTitle?: string;
  breakpoint?: number; // Single dynamic pixel value (default: 540)
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children?:
    | React.ReactNode
    | ((props: ExpandableSearchRenderProps) => React.ReactNode);
}

function ExpandableSearchComponent({
  value,
  onChange,
  placeholder = "Search...",
  totalCount,
  resultLabel,
  disabled = false,
  className,
  inputClassName,
  desktopMaxWidth = "max-w-md",
  triggerTitle = "Search",
  breakpoint = 540,
  isExpanded: controlledExpanded,
  onExpandedChange,
  children,
}: ExpandableSearchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.offsetWidth);

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<boolean>(
    Boolean(value),
  );

  const isExpanded =
    controlledExpanded !== undefined
      ? controlledExpanded
      : uncontrolledExpanded;

  const handleSetExpanded = useCallback(
    (next: boolean) => {
      onExpandedChange?.(next);
      setUncontrolledExpanded(next);
    },
    [onExpandedChange],
  );

  const isCompact = containerWidth < breakpoint;

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => handleSetExpanded(true)}
      className="relative size-8 p-0 rounded-xl border-border/80 cursor-pointer shrink-0"
      title={triggerTitle}
    >
      <Search className="size-3.5 text-muted-foreground" />
      {Boolean(value) && (
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />
      )}
    </Button>
  );

  // Scenario 1: Custom layout render function
  if (typeof children === "function") {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        {isCompact && isExpanded ? (
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                totalCount={totalCount}
                resultLabel={resultLabel}
                disabled={disabled}
                className="w-full min-w-0"
                inputClassName={inputClassName}
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSetExpanded(false)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0 cursor-pointer"
            >
              Close
            </Button>
          </div>
        ) : (
          children({
            isExpanded,
            setIsExpanded: handleSetExpanded,
            trigger: triggerButton,
            isCompact,
          })
        )}
      </div>
    );
  }

  // Scenario 2: Fixed layout
  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {isCompact ? (
        isExpanded ? (
          /* Compact Expanded Search */
          <div className="flex items-center gap-1.5 w-full">
            <div className="flex-1 min-w-0">
              <SearchInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                totalCount={totalCount}
                resultLabel={resultLabel}
                disabled={disabled}
                className="w-full min-w-0"
                inputClassName={inputClassName}
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSetExpanded(false)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-xl shrink-0 cursor-pointer"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-full">
            {triggerButton}
            {children}
          </div>
        )
      ) : (
        <div className="flex items-center justify-between gap-2.5 w-full">
          <div className={cn("flex-1 min-w-[160px]", desktopMaxWidth)}>
            <SearchInput
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              totalCount={totalCount}
              resultLabel={resultLabel}
              disabled={disabled}
              inputClassName={inputClassName}
            />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export const ExpandableSearch = React.memo(ExpandableSearchComponent);
