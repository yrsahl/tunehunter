import useDeviceSize from "@/hooks/useDeviceSize";
import { ReactNode } from "react";
import CustomIcon from "./CustomIcon";
import { CustomIconVariant } from "./icons";
import WithTooltip from "./WithTooltip";

interface InfoWithTooltipProps {
  tooltip: ReactNode;
  iconSize?: string;
  variant?: CustomIconVariant;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  /** Overrides the touch toast message; defaults to tooltip text when tooltip is a string */
  touchToast?: ReactNode;
}

const InfoWithTooltip = ({
  tooltip,
  iconSize,
  variant,
  className,
  side = "top",
  touchToast,
}: InfoWithTooltipProps) => {
  const { isSmallDevice } = useDeviceSize();
  const resolvedTouchToast = touchToast ?? (typeof tooltip === "string" ? tooltip : undefined);

  return (
    <WithTooltip
      tooltip={tooltip}
      side={side}
      className={className}
      touchToast={resolvedTouchToast}
    >
      <div
        className={
          isSmallDevice ? "-m-[10px] flex items-center p-[10px]" : "flex items-center gap-2 px-1"
        }
      >
        <CustomIcon icon="info" variant={variant} height={iconSize} width={iconSize} />
      </div>
    </WithTooltip>
  );
};

export default InfoWithTooltip;
