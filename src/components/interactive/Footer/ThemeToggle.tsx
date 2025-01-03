import { Button } from "@/components/ui/button";
import useThemeSettings from "@/hooks/settings/useThemeSettings";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { changeTheme } = useThemeSettings();

  return (
    <Button size="lg" onClick={changeTheme} className="w-20 border-[1px] border-foreground/30">
      <Sun className="h-[1.6rem] w-[1.6rem] rotate-0 scale-125 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.6rem] w-[1.6rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-75" />
    </Button>
  );
}
