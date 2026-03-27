import { ReactNode } from "react";
import CustomIcon from "./CustomIcon";
import { CustomIconVariant } from "./icons";
import WithTooltip from "./WithTooltip";

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
    <WithTooltip tooltip={tooltip} side={side} className={className}>
      <div className="flex items-center gap-2 px-1">
        <CustomIcon icon="info" variant={variant} height={iconSize} width={iconSize} />
      </div>
    </WithTooltip>
  );
};

export default InfoWithToolTip;
