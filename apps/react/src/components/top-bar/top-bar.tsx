import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { WalletBalance } from "./wallet-balance";

export default function TopBar({ className }: { className?: string }) {
    return (
        <div
            className={`grid grid-cols-[1fr_auto_1fr] items-center h-16 bg-black/30 backdrop-blur-sm px-4 ${className}`}
        >
            {/* <ThemeController /> */}
            <div />
            <Link to="/">
                <div className="flex items-center gap-2 ml-2 px-1 justify-center w-fit bg-black hover:bg-slate-800">
                    <h1 className="relative">
                        <span
                            className={cn(
                                "text-2xl font-bold font-serif text-white"
                            )}
                        >
                            Profiteer
                        </span>
                        <span className="absolute top-0 right-0 text-[0.5rem] text-white/70">
                            Beta
                        </span>
                    </h1>
                </div>
            </Link>
            <WalletBalance />
        </div>
    );
}
