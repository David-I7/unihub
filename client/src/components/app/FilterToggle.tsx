import * as React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface FilterToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ComponentType<{ className?: string }>;
  activeColor?: "primary" | "emerald";
  className?: string;
  disabled?: boolean;
}

export function FilterToggle({
  label,
  checked,
  onCheckedChange,
  icon: IconComponent,
  activeColor = "primary",
  className,
  disabled = false,
}: FilterToggleProps) {
  const isEmerald = activeColor === "emerald";

  const activeStyles = isEmerald
    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 hover:bg-emerald-500/15"
    : "border-primary/50 bg-primary/10 text-primary dark:bg-primary/20 hover:bg-primary/15";

  const iconActiveColor = isEmerald
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-primary";

  return (
    <Button
      type="button"
      role="checkbox"
      aria-checked={checked}
      variant={checked ? "secondary" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "rounded-xl transition-colors font-normal text-xs",
        checked
          ? activeStyles
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {IconComponent && (
        <IconComponent
          className={cn(
            "size-3.5 shrink-0",
            checked ? iconActiveColor : "text-muted-foreground",
          )}
        />
      )}
      <span>{label}</span>
      {checked && (
        <Check className={cn("size-3 shrink-0 ml-0.5", iconActiveColor)} />
      )}
    </Button>
  );
}
