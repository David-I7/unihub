import {
  CalendarDays,
  GitPullRequest,
  HomeIcon,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "@/app/academicContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const railLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "grid min-h-14 w-[58px] place-items-center gap-0.5 rounded-lg border-0 bg-transparent p-0 text-[var(--color-rail-text)] no-underline transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-rail-hover)] hover:text-[var(--color-rail-text-active)]",
    isActive &&
      "bg-[var(--bg-rail-hover)] text-[var(--color-rail-text-active)]",
  );

const bottomLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "grid min-w-0 place-items-center gap-0.5 overflow-hidden px-0 py-2 text-[11px] text-[var(--color-rail-text)] no-underline transition-colors hover:bg-[var(--bg-rail-hover)] hover:text-[var(--color-rail-text-active)]",
    isActive &&
      "bg-[var(--bg-rail-hover)] text-[var(--color-rail-text-active)]",
  );

export function Navigation() {
  const items = [
    { to: "/", label: "Home", icon: HomeIcon },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/contribute", label: "Contribute", icon: GitPullRequest },
  ];
  const [theme, setTheme] = useTheme();
  const cycleTheme = () => {
    setTheme((prev) =>
      prev === "system" ? "light" : prev === "light" ? "dark" : "system",
    );
  };
  const ThemeIcon =
    theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  const themeLabel =
    theme === "system" ? "System" : theme === "light" ? "Light" : "Dark";

  return (
    <>
      <aside
        className="sticky top-0 flex h-svh flex-col items-center gap-2.5 bg-[var(--bg-rail)] px-2 py-3.5 text-[var(--color-rail-text)] max-[820px]:hidden"
        aria-label="Primary"
      >
        <img
          src={`${import.meta.env?.BASE_URL || '/'}favicon.svg`}
          alt="UniHub Logo"
          className="h-[42px] w-[42px] rounded-lg object-contain"
        />
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={railLinkClass}
              title={item.label}
            >
              <Icon aria-hidden="true" size={20} />
              <small className="text-[11px]">{item.label}</small>
            </NavLink>
          );
        })}
        <div className="grow" />
        <Button
          type="button"
          variant="ghost"
          className="grid min-h-14 w-[58px] cursor-pointer place-items-center gap-0.5 rounded-lg p-0 text-[var(--color-rail-text)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bg-rail-hover)] hover:text-[var(--color-rail-text-active)]"
          title={`Theme: ${themeLabel}`}
          onClick={cycleTheme}
        >
          <ThemeIcon aria-hidden="true" size={20} />
          <small className="text-[11px]">{themeLabel}</small>
        </Button>
      </aside>
      <nav
        className="fixed inset-x-0 bottom-0 z-[100] hidden h-16 w-screen grid-cols-4 overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-rail)] text-[var(--color-rail-text)] max-[820px]:grid"
        aria-label="Primary"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={bottomLinkClass}
            >
              <Icon aria-hidden="true" size={18} />
              {item.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          className="grid min-w-0 cursor-pointer place-items-center gap-0.5 overflow-hidden border-0 bg-transparent px-0 py-2 text-[11px] text-[var(--color-rail-text)] transition-colors hover:bg-[var(--bg-rail-hover)] hover:text-[var(--color-rail-text-active)]"
          onClick={cycleTheme}
        >
          <ThemeIcon aria-hidden="true" size={18} />
          <small className="text-[11px]">{themeLabel}</small>
        </button>
      </nav>
    </>
  );
}
