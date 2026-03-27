import CustomIcon from "./CustomIcon";
import { CustomIconVariant } from "./icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface InfoWithToolTipInterface {
  tooltip: string;
  iconSize?: string;
  variant?: CustomIconVariant;
  side?: "top" | "right" | "bottom" | "left";
}

const InfoWithToolTip = ({
  tooltip,
  iconSize,
  variant,
  side = "top",
}: InfoWithToolTipInterface) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-2 px-1">
          <CustomIcon icon="info" variant={variant} height={iconSize} width={iconSize} />
        </div>
        <TooltipContent
          className="max-w-56 text-balance border-foreground/30 bg-background text-foreground"
          side={side}
        >
          {tooltip}
        </TooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default InfoWithToolTip;
