"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load theme from localStorage OR system preference
  useEffect(() => {
    if (!mounted) return;

    const stored = localStorage.getItem("theme") as Theme | null;

    if (stored) {
      setThemeState(stored);
    } else {
      setThemeState("light");
    }
  }, [mounted]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }

    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }

    if (theme === "system") {
      localStorage.setItem("theme", "system");

      const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystem = () => {
        systemDark.matches
          ? root.classList.add("dark")
          : root.classList.remove("dark");
      };

      applySystem();
      systemDark.addEventListener("change", applySystem);
      return () => systemDark.removeEventListener("change", applySystem);
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be inside ThemeProvider");
  return context;
};