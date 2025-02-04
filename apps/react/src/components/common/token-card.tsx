import { Link } from "react-router-dom";
import { Token } from "shared/src/types/token";
import { cn } from "../../utils/cn";
import { formatNumber } from "../../utils/formatPrice";

export default function TokenCard({
    token,
    clickable = true,
}: {
    token: Token;
    clickable?: boolean;
}) {
    return (
        <Link
            key={token.mint}
            to={`/wiki/${token.mint}`}
            className={cn(
                clickable ? "hover:scale-105" : "cursor-default",
                "card bg-white shadow-sm rounded rounded-sm"
            )}
        >
            <div className="card-body p-2 flex flex-col items-center text-center text-primary">
                <p className="card-title break-words text-base font-bold">
                    {token.metadata.name.replace(/_/g, " ")}
                </p>
                <p
                    className="text-xs cursor-pointer"
                    // onClick={(e) => {
                    //     e.preventDefault(); // Prevent link navigation
                    //     if (clickable) return;
                    //     navigator.clipboard.writeText(token.mint);
                    //     alert("Copied to clipboard");
                    // }}
                    title="Click to copy"
                >
                    {token.mint}
                </p>
                <div className="flex flex-row gap-4 items-center">
                    <img
                        src={token.metadata.imageUri}
                        alt={token.metadata.name}
                        className="rounded rounded-xl h-24"
                    />

                    <div className="flex flex-col items-center text-center">
                        <p className="text-lg">${token.metadata.symbol}</p>
                        {token.priceUsd !== undefined && (
                            <div className="text-right">
                                <p className="font-bold">
                                    Market cap: $
                                    {formatNumber(
                                        token.priceUsd * token.metadata.supply
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
