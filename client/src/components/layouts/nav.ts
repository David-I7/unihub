import {
  Home,
  Users,
  Calendar,
  type LucideIcon,
} from "lucide-react";

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
];

export function isRouteActive(currentPath: string, targetUrl: string): boolean {
  if (targetUrl === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(targetUrl);
}

