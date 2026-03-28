import useHint from "@/hooks/useHint";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface WithTooltipProps {
  tooltip: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  asChild?: boolean;
  /** Shown as a toast on mobile (≤768px) instead of the hover tooltip */
  mobileToast?: ReactNode;
}

const WithTooltip = ({ tooltip, children, side = "top", className, asChild, mobileToast }: WithTooltipProps) => {
  const { showHint, isSmallDevice } = useHint();

  return (
    <Tooltip>
      <TooltipTrigger
        asChild={asChild}
        tabIndex={-1}
        onClick={mobileToast && isSmallDevice ? () => showHint(mobileToast) : undefined}
      >
        {children}
      </TooltipTrigger>
      {!isSmallDevice && (
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
      )}
    </Tooltip>
  );
};

export default WithTooltip;
