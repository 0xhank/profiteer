import { Link } from "react-router-dom";
import { cn } from "../../utils/cn";
import { WalletBalance } from "./wallet-balance";

export default function TopBar({ className }: { className?: string }) {
  return (
    <div
      className={`flex justify-between items-center h-16 bg-black/50  [filter:url(#noise)] ${className}`}
    >
      <Link to="/">
        <div className="flex items-center gap-2 ml-2 px-1 justify-center bg-black hover:bg-black/90">
          <h1>
            <span className={cn("text-2xl font-bold font-serif text-white")}>news</span>
            <span className={cn("text-2xl font-base-300 font-script text-accent")}>.fun</span>
          </h1>
        </div>
      </Link>
      <WalletBalance />
    </div>
  );
}
