import {
  Home,
  Users,
  Calendar,
  Bell,
  type LucideIcon,
} from "@/components/ui/icons";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Communities",
    url: "/communities",
    icon: Users,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
];

export function isRouteActive(currentPath: string, targetUrl: string): boolean {
  if (targetUrl === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(targetUrl);
}
