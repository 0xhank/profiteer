import { cn } from "../../utils/cn";

export function LoadingPane({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "w-full h-full animate-pulse bg-gray-200 rounded-lg",
                className
            )}
        />
    );
}
