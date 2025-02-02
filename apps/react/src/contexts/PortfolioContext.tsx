"use client";

import { createContext, useState, useEffect, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useServer } from '../hooks/useServer';
import { adminAddress } from '../utils/admin';

interface PortfolioContextType {
  solBalance: number | null;
  isLoading: boolean;
  error: string | null;
  tokenBalances: Record<string, number>;
  refreshPortfolio: () => Promise<void>;
  hasEnoughBalance: (requiredAmount: number) => boolean;
}

export const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const { ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getSolBalance, getAllTokenBalances } = useServer();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({});

  // const walletAddress = useMemo(() => embeddedWallet?.address, [embeddedWallet]);
  const walletAddress = adminAddress;

  const fetchSolBalance = useCallback(async () => {
    // if (!ready) {
    //   return;
    // }

    if (!walletAddress) {
      setSolBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const walletBalance = await getSolBalance.query({ address: walletAddress });
      setSolBalance(walletBalance / 1e9);
      setError(null);
    } catch (err) {
      setError('Error fetching balance');
      console.error('Error fetching balance:', err);
      setSolBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [ready, walletAddress]);

  const hasEnoughBalance = (requiredAmount: number) => {
    if (solBalance === null) return false;
    return solBalance >= requiredAmount;
  };

  const fetchTokenBalances = useCallback(async () => {
    if (!walletAddress) return;
    const balances = (await getAllTokenBalances.query({ address: walletAddress })).reduce((acc, balance) => {
      acc[balance.mint] = balance.balanceToken / 10 ** 6;
      return acc;
    }, {} as Record<string, number>);
    setTokenBalances(balances);
  }, [walletAddress]);

  const refreshPortfolio = useCallback(async () => {
    await Promise.all([fetchSolBalance(), fetchTokenBalances()]);
  }, [fetchSolBalance, fetchTokenBalances]);

  useEffect(() => {
    if (walletAddress) {
      fetchSolBalance();
      fetchTokenBalances();
      const intervalId = setInterval(fetchSolBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [ready, walletAddress, fetchSolBalance, fetchTokenBalances]); // Only depend on ready state and wallet address

  return (
    <PortfolioContext.Provider value={{ solBalance, isLoading, error, tokenBalances, refreshPortfolio, hasEnoughBalance }}>
      {children}
    </PortfolioContext.Provider>
  );
};

