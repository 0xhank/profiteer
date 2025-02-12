import { ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Footer } from "./footer";
interface PageLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
}

export const PageLayout = ({ children, className }: PageLayoutProps) => {
    return (
        <div className="flex flex-col items-center gap-4 w-full pt-26 justify-between">
            <div
                className={cn("flex flex-col gap-4 w-full h-full max-w-[1100px] ", className)}
            >
                {children}
            </div>
            <Footer />
        </div>
    );
};
