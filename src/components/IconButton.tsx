import { type CustomIconType, type CustomIconVariant } from "@/helpers/custom-icons";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type FC } from "react";
import CustomIcon from "./CustomIcon";
import {
  Button,
  CustomButtonBorderedVariant,
  type CustomButtonSizeVariant,
  type CustomButtonVariant,
} from "./ui/button";

interface IProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  bordered?: CustomButtonBorderedVariant;
  icon?: CustomIconType;
  iconPosition?: "left" | "right";
  iconSize?: string;
  text?: string;
  textStyle?: string;
  variant?: CustomButtonVariant;
  size?: CustomButtonSizeVariant;
}

const buttonToIconVariantMap: Record<CustomButtonVariant, CustomIconVariant> = {
  default: "foreground",
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  accent: "accent-foreground",
  destructive: "destructive-foreground",
  success: "success-foreground",

  link: "link-foreground",
  ghost: "ghost-foreground",
  ghostReduced: "ghost-foreground",
  ghostDestructive: "ghost-destructive-foreground",
  ghostPrimary: "primary",
  ghostAccent: "accent-foreground",
  ghostSuccess: "success-foreground",
  outline: "outline-foreground",
  outlinePrimary: "primary",
  outlineSuccess: "success-foreground",
  outlineDestructive: "ghost-destructive-foreground",
  outlineAccent: "accent-foreground",
};

const IconButton: FC<IProps> = ({
  className,
  text,
  icon,
  iconPosition = "left",
  iconSize,
  textStyle,
  variant = "default",
  bordered,
  size,
  children,
  ...extraProps
}) => {
  const iconVariant = icon ? buttonToIconVariantMap[variant ?? "default"] : undefined;

  return (
    <Button
      className={cn(
        "group flex w-full gap-2 font-light opacity-100 transition-all disabled:opacity-50",
        size === "icon" && `h-8 w-8`,
        className,
      )}
      variant={variant ?? "default"}
      size={size ?? "default"}
      bordered={bordered}
      {...extraProps}
    >
      {icon && iconPosition == "left" && (
        <CustomIcon
          icon={icon}
          variant={iconVariant ?? "foreground"}
          width={iconSize}
          height={iconSize}
        />
      )}
      {text && <p className={textStyle ? textStyle : "uppercase tracking-widest"}>{text}</p>}
      {children}
      {icon && iconPosition == "right" && (
        <CustomIcon
          icon={icon}
          variant={iconVariant ?? "foreground"}
          width={iconSize}
          height={iconSize}
        />
      )}
    </Button>
  );
};

export default IconButton;
