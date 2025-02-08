import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="h-full grid grid-rows-[auto_1fr_20px] max-w-[1200px] items-center justify-items-center">
      <main className="flex flex-col gap-4 items-center w-full pt-4 px-4">
        {children}
      </main>
    </div>
  );
};
