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
    <div className={cn("h-full grid grid-rows-[auto_1fr_20px] max-w-[1200px] items-center justify-items-center", className)}>
      <main className="flex flex-col gap-4 items-center w-full pt-4 px-4">
        {children}
      </main>
    </div>
  );
};
