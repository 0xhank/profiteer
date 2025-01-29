"use client";

import { useState, useCallback, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolanaWallets } from '@privy-io/react-auth/solana';
import connection from '@/lib/connection';

export const useWalletBalance = () => {
  const { wallets } = useSolanaWallets();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (wallets.length === 0) {
      setBalance(null);
      setIsLoading(false);
      return;
    }

    try {
      const walletBalance = await connection.getBalance(new PublicKey(wallets[0].address));
      setBalance(walletBalance / 1e9); // Convert lamports to SOL
      setError(null);
    } catch (err) {
      setError('Error fetching balance');
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [wallets]);

  const hasEnoughBalance = (requiredAmount: number) => {
    if (balance === null) return false;
    return balance >= requiredAmount;
  };

  useEffect(() => {
    // Initial fetch
    fetchBalance();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchBalance, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    fetchBalance,
    hasEnoughBalance,
  };
}; 