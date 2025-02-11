import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { SearchBar } from "../common/search-bar";
import { TopStories } from "../home/top-stories";
import { WalletBalance } from "./wallet-balance";

export default function TopBar({ className }: { className?: string }) {
    return (
        <div
            className={`flex flex-col items-center w-full justify-center bg-gray-100 ${className}`}
        >
            <TopStories />
            <div className="bg-gray-700 w-full flex justify-center">
                <div className="grid grid-cols-[1fr_auto_1fr] w-full  max-w-[1100px] items-center px-2 md:px-4 md:pr-6">
                    <div className="relative z-10">
                        <SearchBar secondary={true} />
                    </div>
                    <Link to="/" className="relative z-0">
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
