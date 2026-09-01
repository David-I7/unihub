import { Link } from "react-router";
import { Lock, LogIn, UserPlus } from "@/components/ui/icons";
import useAuthStore from "../store/useAuthStore";
import { Button } from "@/components/ui/button";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthenticatedRoute({
  children,
  title = "Authentication Required",
  description = "You must be authenticated to access this route. Please log in or create an account to continue.",
}: AuthenticatedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    return (
      <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-2xl border bg-card p-6 shadow-xs text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            Loading...
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Please wait while we check your authentication status.
          </p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-2xl border bg-card p-8 shadow-xs text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1">
            <Lock className="size-6" />
          </div>
          <h2 className="mt-3 font-heading text-xl font-extrabold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm">
            {description}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              size="sm"
              className="text-xs font-semibold gap-1.5 px-4 cursor-pointer"
              render={<Link to="/login" />}
            >
              <LogIn className="size-3.5" />
              <span>Log In</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 px-4 cursor-pointer"
              render={<Link to="/register" />}
            >
              <UserPlus className="size-3.5" />
              <span>Sign Up</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
