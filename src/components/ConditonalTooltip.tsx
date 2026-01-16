import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

type ConditionalTooltipProps = {
  active: boolean;
  children: React.ReactNode; // Rendered when active
  disabledChild: React.ReactNode; // Rendered when inactive
  content: React.ReactNode; // Tooltip message shown when inactive
  contentClassName?: string;
};

export default function ConditionalTooltip({
  active,
  children,
  disabledChild,
  content,
  contentClassName = "border-foreground/30 bg-background text-foreground",
}: ConditionalTooltipProps) {
  if (active) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{disabledChild}</TooltipTrigger>
      <TooltipContent className={contentClassName}>{content}</TooltipContent>
    </Tooltip>
  );
}
