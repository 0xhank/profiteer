import { usePortfolio } from "./usePortfolio";

export const useTokenBalance = (tokenAddress: string) => {
  const { tokenBalances } = usePortfolio();

  const balance = tokenBalances[tokenAddress] ?? 0;

  return { balance: balance ?? 0 };
};