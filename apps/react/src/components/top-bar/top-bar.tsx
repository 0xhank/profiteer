import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { WalletBalance } from "./wallet-balance";
import { SearchBar } from "../common/search-bar";

export default function TopBar({ className }: { className?: string }) {
    return (
        <div
            className={`grid grid-cols-[1fr_auto_1fr] items-center h-16 bg-black/70 backdrop-blur-sm px-4 ${className}`}
        >
            {/* <ThemeController /> */}
            <SearchBar secondary={true} />
            <Link to="/">
                <div className="flex items-center gap-2 ml-2 px-1 justify-center w-fit hover:bg-slate-800/20">
                    <h1 className="relative">
                        <span
                            className={cn(
                                "text-2xl font-bold font-serif text-white"
                            )}
                        >
                            Profiteer{" "}
                        </span>
                        <span
                            className={cn(
                                "text-2xl font-bold font-script text-accent"
                            )}
                        >
                            News
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
