import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

type ThemeState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveEffectiveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

function applyThemeToDocument(theme: Theme): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  const resolved = resolveEffectiveTheme(theme);
  root.classList.add(resolved);
  return resolved;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: getSystemTheme(),
      setTheme: (theme: Theme) => {
        const resolvedTheme = applyThemeToDocument(theme);
        set({ theme, resolvedTheme });
      },
    }),
    {
      name: "unihub-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          const resolvedTheme = applyThemeToDocument(state.theme);
          state.resolvedTheme = resolvedTheme;
        }
      },
    },
  ),
);

// Listen to system color scheme changes when theme is set to 'system'
if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleSystemThemeChange = () => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === "system") {
      const resolvedTheme = applyThemeToDocument("system");
      useThemeStore.setState({ resolvedTheme });
    }
  };

  mediaQuery.addEventListener("change", handleSystemThemeChange);
}
