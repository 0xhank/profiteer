import { ReactNode } from "react";
import { cn } from "../../utils/cn";
interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const PageLayout = ({ children, className }: PageLayoutProps) => {
  return (
    <div className={cn("flex flex-col gap-4 max-w-[1200px] pt-8", className)}>
        {children}
    </div>
  );
};
