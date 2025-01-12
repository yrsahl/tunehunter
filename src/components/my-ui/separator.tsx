import clsx from "clsx";
import { type FC, type ReactNode } from "react";

interface IProps {
  spacing?: "small" | "base" | "large";
  className?: string;
  children?: ReactNode;
}

export const Separator: FC<IProps> = ({ spacing, className, children }) => {
  const spacingCss = clsx({
    "my-2": spacing === "small",
    "my-4": spacing === "base",
    "my-8": spacing === "large",
  });

  return (
    <div className={`${spacingCss} flex w-full`}>
      <div className="relative flex-1">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <span className={clsx("w-full border-t", className)} />
        </div>
      </div>
      {children}
      <div className="relative flex-1">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <span className={clsx("w-full border-t", className)} />
        </div>
      </div>
    </div>
  );
};
