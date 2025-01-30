"use client";

import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { Token } from "shared/src/types/token";
import { useServer } from "../hooks/use-server";



interface TokenListContextType {
  tokens: Token[];
  isReady: boolean;
  refreshTokens: () => void;
}

export const TokenListContext = createContext<TokenListContextType | undefined>(
  undefined
);

export function TokenListProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const { getTokens : {query} }= useServer();
    const fetchTokens = useCallback(async () => {
      setLoading(true);
      console.log("fetching tokens");
      try {
        // Set users immediately
        const tokensData = await query();
        console.log("tokensData", tokensData);
        setTokens(tokensData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setIsReady(true);
      }
    }, []);


  useEffect(() => {
    fetchTokens();
    const intervalId = setInterval(fetchTokens, 30000);

    return () => clearInterval(intervalId);
  }, [fetchTokens]);

  const refreshTokens = () => {
    if (!isReady || loading) return;
    fetchTokens();
  };

  return (
    <TokenListContext.Provider value={{ tokens, isReady, refreshTokens }}>
      {children}
    </TokenListContext.Provider>
  );
}
