import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { WalletBalance } from "./wallet-balance";
import { SearchBar } from "../common/search-bar";
import { TokenList } from "../home/top-stories";

export default function TopBar({ className }: { className?: string }) {
    return (
            <div
                className={`flex flex-col items-center w-full justify-center bg-gray-100 ${className}`}
            >
                    <TokenList />
                <div className = "bg-gray-700 w-full flex justify-center">
                <div className="grid grid-cols-[1fr_auto_1fr] w-full  max-w-[1100px] items-center px-4 pr-6">
                    {/* <ThemeController /> */}
                    <SearchBar secondary={true} />
                    <Link to="/">
                        <div className="flex items-center gap-1 ml-2 px-1 justify-center w-fit hover:bg-slate-800/20">
                            <h1 className="relative">
                                <span
                                    className={cn(
                                        "text-2xl font-bold font-serif text-white"
                                    )}
                                >
                                    Profiteer
                                </span>

                                <span className="absolute top-0 right-0 text-[0.5rem] text-white/50">
                                    Beta
                                </span>
                            </h1>
                            <img
                                src="/icon.png"
                                alt="Profiteer"
                                className="w-7 h-7"
                            />
                        </div>
                    </Link>
                    <WalletBalance />
                </div>
</div>
            </div>
    );
}
