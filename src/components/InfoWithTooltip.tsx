import CustomIcon from "./CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const InfoWithToolTip = ({ tooltip }: { tooltip: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-2 px-1 pb-1">
          <CustomIcon icon="info" variant="primary" />
        </div>
        <TooltipContent className="border-foreground/30 bg-background text-foreground">
          {tooltip}
        </TooltipContent>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default InfoWithToolTip;
