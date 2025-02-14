import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../sbClient";
import { Database } from "../../../../../database.types";
import { useTokens } from "../../hooks/useTokens";
import { useToken } from "../../hooks/useToken";
import { useSolPrice } from "../../hooks/useSolPrice";
import { cn } from "../../utils/cn";

export interface TokenPriceData {
    priceUsd: number | null;
    priceChange24h: number | null;
}

type SwapData = Database["public"]["Tables"]["swap"]["Row"];
export const RecentTrades = () => {
    const [trades, setTrades] = useState<SwapData[]>([]);
    const { refreshTokens } = useTokens();

    useEffect(() => {
        // Initial fetch of recent trades
        const fetchRecentTrades = async () => {
            const { data, error } = await supabase
                .from("swap")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (error) {
                console.error(error);
            } else {
                await refreshTokens(data.map((trade) => trade.mint));
                setTrades(data);
            }
        };

        fetchRecentTrades();

        // Set up realtime subscription
        const channel = supabase
            .channel("swap_changes")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "swap",
                },
                (payload) => {
                    setTrades((prevTrades) => {
                        const newTrades = [
                            payload.new as SwapData,
                            ...prevTrades.slice(0, 9),
                        ];
                        return newTrades;
                    });
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            channel.unsubscribe();
        };
    }, []);

    return (
        <div className="w-full flex gap-1 sm:transition-transform sm:duration-300">
            {trades.map((trade, index) => (
                <TradeItem key={trade.id} trade={trade} index={index} />
            ))}
        </div>
    );
};

export const LeftChevron = ({ className }: { className?: string }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
            className={className}
        >
            <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
        </svg>
    );
};

export const TradeItem = ({
    trade,
    index,
}: {
    trade: SwapData;
    index: number;
}) => {
    const navigate = useNavigate();
    const { token, refreshToken } = useToken(trade.mint);
    const { priceUsd } = useSolPrice();

    useEffect(() => {
        refreshToken();
    }, []);
    return (
        <div
            className="relative h-full flex gap-1 text-sm items-center p-1 hover:cursor-pointer bg-white hover:bg-slate-50 border rounded-sm border-accent"
            onClick={() => navigate(`/wiki/${trade.mint}`)}
        >
                    <p className="text-md font-light">
                        {token.metadata.symbol}
                    </p>
            {token.priceUsd && (
                <p
                    className={cn(
                        "text-center",
                        trade.is_buy ? "text-green-500" : "text-red-500"
                    )}
                >
                    ${((priceUsd * trade.sol_amount) / 1e9).toFixed(0)}
                </p>
            )}
        </div>
    );
};
