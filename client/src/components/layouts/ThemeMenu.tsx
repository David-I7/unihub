import { Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/store/useThemeStore";

export function ThemeIcon({ className = "size-3.5" }: { className?: string }) {
  const theme = useThemeStore((state) => state.theme);
  if (theme === "dark") return <Moon className={className} />;
  if (theme === "light") return <Sun className={className} />;
  return <Laptop className={className} />;
}

export function ThemeMenuItems() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme("light")} className="cursor-pointer">
        <Sun className="mr-2 size-3.5" />
        <span>Light</span>
        {theme === "light" && <span className="ml-auto text-xs font-bold">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")} className="cursor-pointer">
        <Moon className="mr-2 size-3.5" />
        <span>Dark</span>
        {theme === "dark" && <span className="ml-auto text-xs font-bold">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")} className="cursor-pointer">
        <Laptop className="mr-2 size-3.5" />
        <span>System</span>
        {theme === "system" && <span className="ml-auto text-xs font-bold">✓</span>}
      </DropdownMenuItem>
    </>
  );
}

export function ThemeSubMenu() {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <ThemeIcon className="mr-2 size-4" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="p-1 min-w-32">
        <ThemeMenuItems />
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function ThemeDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground h-6 w-6 cursor-pointer"
          >
            <ThemeIcon />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-32 p-1">
        <ThemeMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
