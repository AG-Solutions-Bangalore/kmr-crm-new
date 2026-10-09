import * as React from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  themes: Theme[];
  systemTheme?: "light" | "dark";
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored) return stored;
    } catch {
      // ignore localStorage errors
    }
    return defaultTheme;
  });

  const getSystemTheme = React.useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  const [systemTheme, setSystemTheme] = React.useState<"light" | "dark">(getSystemTheme);

  const resolvedTheme: "light" | "dark" =
    theme === "system" && enableSystem ? systemTheme : theme === "dark" ? "dark" : "light";

  React.useEffect(() => {
    if (!enableSystem) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [enableSystem]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute(attribute, resolvedTheme);
    }
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme, attribute]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // ignore localStorage errors
      }
      setThemeState(newTheme);
    },
    [storageKey],
  );

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      themes: ["light", "dark", "system"] as Theme[],
      systemTheme,
    }),
    [theme, resolvedTheme, setTheme, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
