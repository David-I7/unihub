import { Link } from "react-router";
import { Lock, LogIn, UserPlus } from "@/components/ui/icons";
import useAuthStore from "../store/useAuthStore";
import { Button } from "@/components/ui/button";

export default function AuthenticatedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);

  if (!initialized) {
    //loading state while auth is being initialized
    return (
      <div className="flex flex-1 min-h-full w-full flex-col items-center justify-center p-4 my-auto animate-in fade-in duration-200">
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-2xl border bg-card p-6 shadow-xs">
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
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-2xl border bg-card p-6 shadow-xs">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <h2 className="mt-3 font-heading text-lg font-bold text-foreground">
            Authentication Required
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            You must be authenticated to access this route. Please log in or
            create an account to continue.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2.5">
            <Button
              size="sm"
              className="text-xs font-semibold gap-1.5 px-4 cursor-pointer"
              render={<Link to="/login" />}
            >
              <LogIn className="size-3.5" />
              Log In
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 px-4 cursor-pointer"
              render={<Link to="/register" />}
            >
              <UserPlus className="size-3.5" />
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
