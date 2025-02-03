import { useTokens } from "../../hooks/useTokens";
import TokenCard from "../common/token-card";

export interface TokenPriceData {
    priceUsd: number | null;
    priceChange24h: number | null;
}

export const TokenList = () => {
    const { tokens, isReady } = useTokens();

    if (!isReady) {
        return (
            <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-200 dark:bg-gray-700 h-24 rounded-xl"
                    ></div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <h2 className="text-2xl font-bold">Top Memes</h2>
        <div className="grid grid-cols-1 gap-4">
            {Object.entries(tokens).map(([key, token]) => (
                <TokenCard key={key} token={token} />
            ))}
        </div>
</div>
    );
};
