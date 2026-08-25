import {
  Home,
  Users,
  GraduationCap,
  CalendarDays,
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
    title: "Teachers",
    url: "/teachers",
    icon: GraduationCap,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: CalendarDays,
  },
];
