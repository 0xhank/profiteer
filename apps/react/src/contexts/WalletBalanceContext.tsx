"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { usePrivy } from '@privy-io/react-auth';
import { useEmbeddedWallet } from '../hooks/useEmbeddedWallet';

const RPC_ENDPOINT = 'https://special-yolo-butterfly.solana-mainnet.quiknode.pro/ebf72b17cd8c4be0b4ae113cd927b3803d793c17/';

interface WalletBalanceContextType {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  hasEnoughBalance: (requiredAmount: number) => boolean;
}

const WalletBalanceContext = createContext<WalletBalanceContextType | null>(null);

export const WalletBalanceProvider = ({ children }: { children: React.ReactNode }) => {
  const embeddedWallet = useEmbeddedWallet();
  const { ready } = usePrivy();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = embeddedWallet?.address;

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
      const connection = new Connection(RPC_ENDPOINT, 'confirmed');
      const walletBalance = await connection.getBalance(new PublicKey(walletAddress));
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
    <WalletBalanceContext.Provider value={{ balance, isLoading, error, fetchBalance, hasEnoughBalance }}>
      {children}
    </WalletBalanceContext.Provider>
  );
};

export const useWalletBalance = () => {
  const context = useContext(WalletBalanceContext);
  if (!context) {
    throw new Error('useWalletBalance must be used within a WalletBalanceProvider');
  }
  return context;
}; 