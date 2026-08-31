import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingInputProps {
  value: number;
  onChange?: (value: number) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STAR_SIZE_CLASSES = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

export function StarRatingInput({
  value,
  onChange,
  label,
  description,
  disabled = false,
  readOnly = false,
  size = "md",
  className,
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;
  const starSize = STAR_SIZE_CLASSES[size] || STAR_SIZE_CLASSES.md;

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || description) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-xs font-semibold text-foreground">{label}</span>
          )}
          {value > 0 && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {value} / 5
            </span>
          )}
        </div>
      )}
      {description && (
        <p className="text-[11px] text-muted-foreground">{description}</p>
      )}

      <div
        className="flex items-center gap-1"
        onMouseLeave={() => !readOnly && !disabled && setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;

          if (readOnly) {
            return (
              <Star
                key={star}
                className={cn(
                  starSize,
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-muted/40 text-muted-foreground/30",
                )}
              />
            );
          }

          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(star)}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              className={cn(
                "p-1 rounded-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:scale-110 active:scale-95",
              )}
              aria-label={`Rate ${star} out of 5 stars`}
            >
              <Star
                className={cn(
                  starSize,
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                    : "fill-muted/30 text-muted-foreground/40 hover:text-amber-300",
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
