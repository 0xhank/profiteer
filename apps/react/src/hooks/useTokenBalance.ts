import { useCallback, useEffect, useState } from "react";
import { useEmbeddedWallet } from "./useEmbeddedWallet";
import { useToken } from "@/contexts/TokenContext";
import { getTokenBalance } from "@/utils/tokenAccount";
import connection from "@/lib/connection";

export const useTokenBalance = (propTokenAddress: string) => {
  const { tokenAddress: contextTokenAddress } = useToken();
  const embeddedWallet = useEmbeddedWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use prop tokenAddress if provided, otherwise fall back to context
  const tokenAddress = propTokenAddress || contextTokenAddress;



  const fetchTokenBalance = useCallback(async () => {
      if (!tokenAddress || !embeddedWallet?.address) {
        setBalance(null);
        setIsLoading(false);
        return;
      }

      try {
        const userBalance = await getTokenBalance(
          connection,
          embeddedWallet.address,
          tokenAddress
        );
        return userBalance;
      } catch (err) {
        console.error('Error fetching token balance:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [tokenAddress, embeddedWallet?.address]);

  const refreshBalance = useCallback(async () => {
    const balance = await fetchTokenBalance();
    if (balance) {
      setBalance(balance);
    }
  }, [fetchTokenBalance]);

  useEffect(() => {
    refreshBalance();
    const intervalId = setInterval(refreshBalance, 30000);

    return () => clearInterval(intervalId);
  }, [tokenAddress, embeddedWallet?.address, refreshBalance]);

  return {balance: balance ?? 0, isLoading };

};