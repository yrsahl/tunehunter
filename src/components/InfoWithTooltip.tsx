import { ReactNode } from "react";
import CustomIcon from "./CustomIcon";
import { CustomIconVariant } from "./icons";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface InfoWithToolTipInterface {
  tooltip: ReactNode;
  iconSize?: string;
  variant?: CustomIconVariant;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
}

const InfoWithToolTip = ({
  tooltip,
  iconSize,
  variant,
  className,
  side = "top",
}: InfoWithToolTipInterface) => {
  return (
    <Tooltip>
      <TooltipTrigger tabIndex={-1}>
        <div className="flex items-center gap-2 px-1">
          <CustomIcon icon="info" variant={variant} height={iconSize} width={iconSize} />
        </div>
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

export default InfoWithToolTip;
