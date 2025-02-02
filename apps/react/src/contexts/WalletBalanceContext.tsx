"use client";

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useEmbeddedWallet } from '../hooks/useEmbeddedWallet';
import { useServer } from '../hooks/useServer';

interface PortfolioContextType {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  hasEnoughBalance: (requiredAmount: number) => boolean;
}

export const PortfolioContext = createContext<PortfolioContextType | null>(null);

export const PortfolioProvider = ({ children }: { children: React.ReactNode }) => {
  const embeddedWallet = useEmbeddedWallet();
  const { ready } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getBalance } = useServer();

  const walletAddress = useMemo(() => embeddedWallet?.address, [embeddedWallet]);

  const fetchBalance = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (!walletAddress) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const walletBalance = await getBalance.query({ address: walletAddress });
      setBalance(walletBalance / 1e9);
      setError(null);
    } catch (err) {
      setError('Error fetching balance');
      console.error('Error fetching balance:', err);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [ready, walletAddress]);

  const hasEnoughBalance = (requiredAmount: number) => {
    if (balance === null) return false;
    return balance >= requiredAmount;
  };

  useEffect(() => {
    if (ready && walletAddress) {
      fetchBalance();
      const intervalId = setInterval(fetchBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [ready, walletAddress, fetchBalance]); // Only depend on ready state and wallet address

  return (
    <PortfolioContext.Provider value={{ balance, isLoading, error, fetchBalance, hasEnoughBalance }}>
      {children}
    </PortfolioContext.Provider>
  );
};

