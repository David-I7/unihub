import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { EyeOff, Eye } from "./icons";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  if (type === "password") {
    return <PasswordInput className={className} {...props} />;
  }

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

function PasswordInput({ className, ...props }: React.ComponentProps<"input">) {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div
      className={cn(
        "flex items-center h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
    >
      <InputPrimitive
        type={showPassword ? "text" : "password"}
        data-slot="input"
        className="flex-1 h-full bg-transparent outline-none placeholder:text-muted-foreground"
        {...props}
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Eye /> : <EyeOff />}
      </Button>
    </div>
  );
}

export { Input };
