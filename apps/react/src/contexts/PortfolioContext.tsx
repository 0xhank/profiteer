"use client";

import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useServer } from "../hooks/useServer";
import { useEmbeddedWallet } from "../hooks/useEmbeddedWallet";

interface PortfolioContextType {
    walletAddress: string | null;
    solBalance: number;
    isLoading: boolean;
    error: string | null;
    tokenBalances: Record<string, number>;
    refreshPortfolio: () => Promise<void>;
    hasEnoughBalance: (requiredAmount: number) => boolean;
}

export const PortfolioContext = createContext<PortfolioContextType | null>(
    null
);

export const PortfolioProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const embeddedWallet = useEmbeddedWallet();
    const { login } = usePrivy();

    const { ready } = usePrivy();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getSolBalance, getAllTokenBalances } = useServer();
    const [solBalance, setSolBalance] = useState<number>(0);
    const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(
        {}
    );
    const { ready: walletsReady, wallets } = useSolanaWallets();

    const walletAddress = useMemo(() => {
      console.log({wallets})
        if (wallets.length === 0) 
            return null; 
        return wallets[0]!.address;
    }, [embeddedWallet]);

    const fetchSolBalance = useCallback(async () => {
        if (!ready || !walletsReady) {
            setIsLoading(false);
            return;
        }
        if (wallets.length === 0) {
            setSolBalance(0);
            setIsLoading(false);
            return;
        }
        const walletAddress = wallets[0]!.address;

        if (!walletAddress) {
            setSolBalance(0);
            setIsLoading(false);
            return;
        }

        try {
            const walletBalance = await getSolBalance.query({
                address: walletAddress,
            });
            setSolBalance(walletBalance / 1e9);
            setError(null);
        } catch (err) {
            setError("Error fetching balance");
            console.error("Error fetching balance:", err);
            setSolBalance(0);
        } finally {
            setIsLoading(false);
        }
    }, [getSolBalance, ready, walletAddress]);

    const hasEnoughBalance = (requiredAmount: number) => {
        if (solBalance === null) return false;
        return solBalance >= requiredAmount;
    };

    const fetchTokenBalances = useCallback(async () => {
        if (!walletAddress) return;
        const balances = (
            await getAllTokenBalances.query({ address: walletAddress })
        ).reduce((acc, balance) => {
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
        } else {
            setIsLoading(false);
        }
    }, [ready, walletAddress, fetchSolBalance, fetchTokenBalances, login]); // Only depend on ready state and wallet address

    return (
        <PortfolioContext.Provider
            value={{
                walletAddress,
                solBalance,
                isLoading,
                error,
                tokenBalances,
                refreshPortfolio,
                hasEnoughBalance,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
};
