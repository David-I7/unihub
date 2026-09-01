import { useAuthStore } from "@/features/auth";
import {
  MyRemindersWidget,
  UpcomingEventsWidget,
  MyCommunitiesWidget,
} from "@/features/home";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-full max-w-5xl mx-auto space-y-8 pb-16">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {user ? `Welcome back, ${user.username}` : "Welcome to Unihub"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Here is an overview of your active reminders, upcoming academic events,
          and enrolled communities.
        </p>
      </div>

      {/* 1. My Reminders Section (First) */}
      <section className="w-full">
        <MyRemindersWidget />
      </section>

      {/* 2. Upcoming Events Section (Second) */}
      <section className="w-full">
        <UpcomingEventsWidget />
      </section>

      {/* 3. My Communities Section (Third) */}
      <section className="w-full">
        <MyCommunitiesWidget />
      </section>
    </div>
  );
}
