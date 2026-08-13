import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageCopy } from "@/i18n/page-copy";

export function ThemeToggle() {
  const copy = usePageCopy();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("estichara-theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefers;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("estichara-theme", next ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? copy.theme.light : copy.theme.dark}
      className="rounded-xl"
    >
      {dark ? (
        <Sun className="size-4 text-accent" />
      ) : (
        <Moon className="size-4" />
      )}
    </Button>
  );
}
