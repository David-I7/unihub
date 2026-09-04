import { useAuthStore } from "@/features/auth";
import {
  MyRemindersWidget,
  UpcomingEventsWidget,
  MyCommunitiesWidget,
} from "@/features/home";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-full max-w-6xl mx-auto space-y-6 pb-16">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {user && `Welcome back, ${user.username}`}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Here is an overview of your active reminders, upcoming academic
          events, and enrolled communities.
        </p>
      </div>

      {/* Top 2-Column Grid: Upcoming Events (Left) & My Reminders (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="w-full h-full">
          <UpcomingEventsWidget />
        </section>

        <section className="w-full h-full">
          <MyRemindersWidget />
        </section>
      </div>

      {/* Bottom Full-Width Section: My Communities */}
      <section className="w-full">
        <MyCommunitiesWidget />
      </section>
    </div>
  );
}
