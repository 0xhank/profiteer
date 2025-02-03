import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="h-full grid grid-rows-[auto_1fr_20px] max-w-[1200px] items-center justify-items-center">
      <svg className="fixed w-0 h-0">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.7"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComposite operator="in" in2="SourceGraphic" />
          <feBlend mode="multiply" in2="SourceGraphic" />
        </filter>
      </svg>
      
      <main className="flex flex-col gap-8 items-center w-full mt-20">
        {children}
      </main>
    </div>
  );
};
