import { ArrowLeft } from "@/components/ui/icons";
import { Link } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateCardProps {
  message: string;
  onRetry?: () => void;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export function ErrorStateCard({
  message,
  onRetry,
  backTo,
  backLabel = "Back",
  className,
}: ErrorStateCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center space-y-3 shadow-xs",
        className,
      )}
    >
      <p className="text-sm font-semibold text-destructive">{message}</p>
      <div className="flex items-center gap-2">
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="cursor-pointer text-xs font-medium"
          >
            Try Again
          </Button>
        )}
        {backTo && (
          <Link
            to={backTo}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1.5 cursor-pointer text-xs font-medium",
            })}
          >
            <ArrowLeft className="size-4" /> {backLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

export default ErrorStateCard;
