import useHint from "@/hooks/useHint";
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
  /** Overrides the mobile toast message; defaults to tooltip text when tooltip is a string */
  mobileToast?: ReactNode;
}

const InfoWithToolTip = ({
  tooltip,
  iconSize,
  variant,
  className,
  side = "top",
  mobileToast,
}: InfoWithToolTipInterface) => {
  const { isSmallDevice } = useHint();
  const resolvedMobileToast = mobileToast ?? (typeof tooltip === "string" ? tooltip : undefined);

  return (
    <WithTooltip tooltip={tooltip} side={side} className={className} mobileToast={resolvedMobileToast}>
      <div className={isSmallDevice ? "flex items-center p-[10px] -m-[10px]" : "flex items-center gap-2 px-1"}>
        <CustomIcon icon="info" variant={variant} height={iconSize} width={iconSize} />
      </div>
    </WithTooltip>
  );
};

export default InfoWithToolTip;
