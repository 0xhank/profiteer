import { useUserList } from "@/hooks/useUserList";
import TokenCard from "./TokenCard";

export interface TokenPriceData {
  priceUsd: number | null;
  priceChange24h: number | null;
}

export const TokenList = () => {
  const { users, prices, loading } = useUserList();

  if (loading) {
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
      {users.map((user) => (
        <TokenCard key={user.id} user={user} prices={prices} />
      ))}
    </div>
  );
};