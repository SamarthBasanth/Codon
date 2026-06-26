"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = (typeof localStorage !== "undefined" &&
      localStorage.getItem("codon-theme")) as Theme | null;
    // Default to the paper identity; only honor an explicit stored choice.
    setTheme(stored === "dark" || stored === "light" ? stored : "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("codon-theme", theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

/** Inline script string injected before paint to avoid a theme flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('codon-theme');if(t!=='dark'){t='light';}var e=document.documentElement;if(t==='dark'){e.classList.add('dark');}e.style.colorScheme=t;}catch(e){}})();`;
