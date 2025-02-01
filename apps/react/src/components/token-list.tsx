import { useTokens } from "../hooks/useTokens";
import TokenCard from "./token-card";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(tokens).map(([key, token]) => (
        <TokenCard key={key} token={token} />
      ))}
    </div>
  );
};
