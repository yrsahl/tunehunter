import { Button } from "@/components/ui/button";
import useThemeSettings from "@/hooks/settings/useThemeSettings";
import useDeviceSize from "@/hooks/useDeviceSize";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { changeTheme } = useThemeSettings();
  const { isExtraSmallDevice } = useDeviceSize();
  const buttonSize = isExtraSmallDevice ? "default" : "lg";

  return (
    <Button
      size={buttonSize}
      onClick={changeTheme}
      className="w-[72px] border-[1px] border-foreground/30 sm:w-20"
    >
      <Sun className="h-[1.6rem] w-[1.6rem] rotate-0 scale-75 transition-all dark:-rotate-90 dark:scale-0 sm:scale-125" />
      <Moon className="absolute h-[1.6rem] w-[1.6rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-75" />
    </Button>
  );
};

export default ThemeToggle;
