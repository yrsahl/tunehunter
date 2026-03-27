import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface WithTooltipProps {
  tooltip: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  asChild?: boolean;
}

const WithTooltip = ({ tooltip, children, side = "top", className, asChild }: WithTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild} tabIndex={-1}>
        {children}
      </TooltipTrigger>
      <TooltipContent
        className={cn(
          "border-foreground/30 bg-background text-foreground",
          typeof tooltip === "string" ? "max-w-56 text-pretty" : "w-max",
          className,
        )}
        side={side}
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

export default WithTooltip;
