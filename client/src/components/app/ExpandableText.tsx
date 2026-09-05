import {
  memo,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExpandableTextProps {
  children: ReactNode;
  className?: string;
  textClassName?: string;
  clampLines?: 1 | 2 | 3 | 4 | 5 | 6;
  expandLabel?: string;
  collapseLabel?: string;
  footer?: ReactNode;
  actionClassName?: string;
}

const CLAMP_CLASSES: Record<number, string> = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export const ExpandableText = memo(function ExpandableText({
  children,
  className,
  textClassName,
  clampLines = 2,
  expandLabel = "See more",
  collapseLabel = "See less",
  footer,
  actionClassName,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const checkOverflow = () => {
      if (!isExpanded) {
        setIsOverflowing(el.scrollHeight - el.clientHeight > 1);
      }
    };

    checkOverflow();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });
      resizeObserver.observe(el);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [children, isExpanded, clampLines]);

  const clampClass = CLAMP_CLASSES[clampLines] ?? "line-clamp-2";

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={cn(textClassName, !isExpanded && clampClass)}
      >
        {children}
        {isExpanded && isOverflowing && (
          <Button
            variant="link"
            size="link"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
            }}
            className={cn(
              "text-muted-foreground hover:text-foreground inline text-xs font-semibold h-auto p-0 ml-1 cursor-pointer",
              actionClassName,
            )}
          >
            {collapseLabel}
          </Button>
        )}
      </div>

      {((!isExpanded && isOverflowing) || Boolean(footer)) && (
        <div className="flex items-center gap-1.5 mt-0.5">
          {!isExpanded && isOverflowing && (
            <Button
              variant="link"
              size="link"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(true);
              }}
              className={cn(
                "text-muted-foreground hover:text-foreground text-xs font-semibold h-auto p-0 cursor-pointer",
                actionClassName,
              )}
            >
              {expandLabel}
            </Button>
          )}
          {footer}
        </div>
      )}
    </div>
  );
});

export default ExpandableText;
