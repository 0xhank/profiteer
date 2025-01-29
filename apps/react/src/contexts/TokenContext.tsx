"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy, User } from '@privy-io/react-auth';
import { useEmbeddedWallet } from '../hooks/useEmbeddedWallet';

interface TokenContextType {
  hasToken: boolean | null;
  tokenAddress: string | null;
  twitterUsername: string | null;
  isLoading: boolean;
}

const TokenContext = createContext<TokenContextType | null>(null);

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const { authenticated } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      if (authenticated && embeddedWallet?.address) {
        try {
          // const users = await getAllUsers();
          const users : User[] = [];
          const userInfo = users.find(user => user.solana_address === embeddedWallet.address);
          setHasToken(!!userInfo?.token_address);
          setTokenAddress(userInfo?.token_address || null);
          setTwitterUsername(userInfo?.twitter_username || null);
        } catch (error) {
          console.error('Error checking token status:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkToken();
  }, [authenticated, embeddedWallet?.address]);

  return (
    <TokenContext.Provider value={{ hasToken, tokenAddress, twitterUsername, isLoading }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
}; 