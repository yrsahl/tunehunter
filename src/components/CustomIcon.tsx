import customIcons, { type CustomIconType, type CustomIconVariant } from "@/components/icons";
import { cn } from "@/lib/utils";
import { type FC } from "react";

interface CustomIconProps {
  icon: CustomIconType;
  height?: string;
  width?: string;
  variant?: CustomIconVariant;
  className?: string;
}

const CustomIcon: FC<CustomIconProps> = ({
  icon,
  height = "20px",
  width = "20px",
  variant,
  className,
}) => {
  const classes = (() => {
    switch (variant) {
      // Colors
      case "background":
        return "fill-background";
      case "primary":
        return "fill-primary group-hover:fill-primary-foreground";
      case "primary-muted":
        return "fill-primary/30";
      case "secondary":
        return "fill-secondary";
      case "accent":
        return "fill-accent";
      case "destructive":
        return "fill-destructive";
      case "info":
        return "fill-info";

      // For buttons
      case "foreground":
        return "fill-foreground";
      case "primary-foreground":
        return "fill-primary-foreground";
      case "secondary-foreground":
        return "fill-secondary-foreground";
      case "accent-foreground":
        return "fill-accent-foreground";
      case "success-foreground":
        return "fill-success-foreground";
      case "destructive-foreground":
        return "fill-destructive-foreground";
      case "ghost-foreground":
        return "fill-foreground";
      case "ghost-destructive-foreground":
        return "fill-destructive group-hover:fill-destructive-foreground";
      case "link-foreground":
        return "fill-primary";
      case "outline-foreground":
        return "fill-primary";
      default:
        return "";
    }
  })();
  return (
    <div className={cn("transition-colors", classes, className)} style={{ height, width }}>
      {customIcons[icon]}
    </div>
  );
};

export default CustomIcon;
