import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { SearchBar } from "../common/search-bar";
import { RecentTrades } from "../home/recent-trades";
import { WalletBalance } from "./wallet-balance";
import { Modal } from "../common/modal";

export default function TopBar() {
    return (
        <div className="w-full flex flex-col justify-center items-center sticky top-0 z-[999]">
            <div className="bg-gray-700  w-full flex justify-center">
                <div className="grid grid-cols-[1fr_auto_1fr] w-full max-w-[1100px] items-center px-2 md:px-4 md:pr-6">
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
                    <div className="flex items-center justify-end gap-2">
                        <Modal>
                            <Modal.Button className="btn btn-ghost btn-sm hidden md:block">
                                <QuestionIcon className="w-6 h-6 text-white" />
                            </Modal.Button>
                            <Modal.Content>
                                <div className="flex flex-col gap-2 bg-white p-4 rounded-sm w-[500px]">
                                    <h3 className="text-2xl font-bold">
                                        How it works
                                    </h3>
                                    <p>Profiteer is a newscoin launchpad.</p>
                                    <p>Headlines contain links to trending newscoins that are tradeable on a bonding curve.</p>
                                    <p>Anyone can create a newscoin, but there is only one possible newscoin per topic. This ensures that there cannot be multiple newscoins for the same topic.</p>
                                    <p>After a newscoin is created, there is a short-term Early Bird Fee which protects the community from scams.</p>
                                </div>
                            </Modal.Content>
                        </Modal>
                        <WalletBalance />
                    </div>
                </div>
            </div>
            <div className="w-full max-w-[1100px] bg-gray-100 rounded-b-sm p-2 flex justify-center">
                <RecentTrades />
            </div>
        </div>
    );
}

const QuestionIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
        </svg>
    );
};
