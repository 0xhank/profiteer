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
          <div className="flex flex-col">
            <h1 className={cn("text-2xl font-bold")}>news</h1>
          </div>
        </div>
      </Link>
      <WalletBalance />
    </div>
  );
}
