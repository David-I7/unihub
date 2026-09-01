import { useAuthStore } from "@/features/auth";
import {
  UpcomingEventsWidget,
  MyRemindersWidget,
  MyCommunitiesWidget,
} from "@/features/home";

export default function HomePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-full space-y-6 pb-12">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {user ? `Welcome back, ${user.username}` : "Welcome to Unihub"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Here is an overview of your upcoming academic events, active reminders,
          and enrolled communities.
        </p>
      </div>

      {/* 2-Column Dashboard Grid: Events & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <UpcomingEventsWidget />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <MyRemindersWidget />
        </div>
      </div>

      {/* Enrolled Communities Section */}
      <div className="w-full">
        <MyCommunitiesWidget />
      </div>
    </div>
  );
}
