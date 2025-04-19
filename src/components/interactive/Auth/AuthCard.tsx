import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  size?: "small" | "default" | "big";
}

const AuthCard = ({ title, description, children, size = "default" }: AuthCardProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 overflow-y-auto rounded-[2rem] border border-foreground bg-background px-6 py-6 md:px-8 md:py-6 lg:px-10 lg:py-8",
        size === "small" && "min-w-80 max-w-sm",
        size === "default" && "max-w-xl",
        size === "big" && "max-w-4xl",
      )}
    >
      {title && <h1 className="mb-1 text-lg">{title}</h1>}
      {description && <p className="text-center">{description}</p>}
      {children}
    </div>
  );
};

export default AuthCard;
