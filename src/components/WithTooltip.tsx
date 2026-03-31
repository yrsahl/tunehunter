import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface WithTooltipProps {
  tooltip: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  asChild?: boolean;
  /** Shown as a toast on touch/coarse-pointer devices. */
  touchToast?: ReactNode;
}

const WithTooltip = ({
  tooltip,
  children,
  side = "top",
  className,
  asChild,
  touchToast,
}: WithTooltipProps) => {
  const [canHover, setCanHover] = useState(false);
  const [hasTouchInput, setHasTouchInput] = useState(false);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const coarseQuery = window.matchMedia("(any-pointer: coarse)");

    const updateInputCapabilities = () => {
      setCanHover(hoverQuery.matches);
      setHasTouchInput(
        coarseQuery.matches || navigator.maxTouchPoints > 0 || "ontouchstart" in window,
      );
    };

    updateInputCapabilities();
    hoverQuery.addEventListener("change", updateInputCapabilities);
    coarseQuery.addEventListener("change", updateInputCapabilities);

    return () => {
      hoverQuery.removeEventListener("change", updateInputCapabilities);
      coarseQuery.removeEventListener("change", updateInputCapabilities);
    };
  }, []);

  const resolvedTouchToast = touchToast ?? (typeof tooltip === "string" ? tooltip : undefined);

  const handleMobileHint = () => {
    if (hasTouchInput && resolvedTouchToast) {
      toast.info(resolvedTouchToast);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        asChild={asChild}
        tabIndex={-1}
        onClick={resolvedTouchToast ? handleMobileHint : undefined}
      >
        {children}
      </TooltipTrigger>
      {canHover && (
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
