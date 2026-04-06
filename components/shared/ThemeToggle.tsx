"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 dark:hover:bg-slate-700/50 light:hover:bg-slate-200/60 cursor-pointer hidden"
      title={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      id="theme-toggle-btn"
    >
      {/* Sun icon — shown in dark mode (click → go light) */}
      {isDark && (
        <Sun
          className={cn(
            "w-5 h-5 absolute transition-all duration-300 rotate-0 scale-100 dark:block",
          )}
        />
      )}
      {/* Moon icon — shown in light mode (click → go dark) */}
      {!isDark && (
        <Moon className={cn("w-5 h-5 absolute transition-all duration-300")} />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
