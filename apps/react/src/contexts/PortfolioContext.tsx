"use client";

import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { ConnectedSolanaWallet, useSolanaWallets } from "@privy-io/react-auth";
import { useServer } from "../hooks/useServer";
import { useEmbeddedWallet } from "../hooks/useEmbeddedWallet";

interface PortfolioContextType {
    wallet: ConnectedSolanaWallet | null;
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

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getSolBalance, getAllTokenBalances } = useServer();
    const [solBalance, setSolBalance] = useState<number>(0);
    const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(
        {}
    );
    const { wallets } = useSolanaWallets();

    const wallet = useMemo(() => {
        if (wallets.length === 0) 
            return null; 
        return wallets[0]
    }, [embeddedWallet]);

    const fetchSolBalance = useCallback(async () => {
        if (!wallet) {
            setSolBalance(0);
            setIsLoading(false);
            return;
        }
        try {
            const walletBalance = await getSolBalance.query({
                address: wallet.address,
            });
            console.log("walletBalance ===>>>", walletBalance);
            setSolBalance(walletBalance / 1e9 );
            setError(null);
        } catch (err) {
            setError("Error fetching balance");
            console.error("Error fetching balance:", err);
            setSolBalance(0);
        } finally {
            setIsLoading(false);
        }
    }, [wallet]);

    const hasEnoughBalance = (requiredAmount: number) => {
        if (solBalance === null) return false;
        return solBalance >= requiredAmount;
    };

    const fetchTokenBalances = useCallback(async () => {
        if (!wallet) return;
        const balances = (
            await getAllTokenBalances.query({ address: wallet.address })
        ).reduce((acc, balance) => {
            acc[balance.mint] = balance.balanceToken / 10 ** 6;
            return acc;
        }, {} as Record<string, number>);
        setTokenBalances(balances);
    }, [wallet]);

    const refreshPortfolio = useCallback(async () => {
        await Promise.all([fetchSolBalance(), fetchTokenBalances()]);
    }, [fetchSolBalance, fetchTokenBalances]);

    useEffect(() => {
        if (wallet) {
            fetchSolBalance();
            fetchTokenBalances();
            const intervalId = setInterval(fetchSolBalance, 30000);
            return () => clearInterval(intervalId);
        } else {
            setIsLoading(false);
        }
    }, [wallet]); // Only depend on ready state and wallet address

    return (
        <PortfolioContext.Provider
            value={{
                wallet,
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
