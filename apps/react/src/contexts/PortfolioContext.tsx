import {
    createContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { ConnectedSolanaWallet, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useServer } from "../hooks/useServer";
import { useTokens } from "../hooks/useTokens";

interface PortfolioContextType {
    wallet: ConnectedSolanaWallet | null;
    solBalance: number;
    isLoading: boolean;
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

    const [isLoading, setIsLoading] = useState(true);
    const { getSolBalance, getAllTokenBalances } = useServer();
    const [solBalance, setSolBalance] = useState<number>(0);
    const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(
        {}
    );
    const {refreshTokens, tokens } = useTokens()
    const { wallets,ready } = useSolanaWallets();
    const { authenticated,   } = usePrivy();

    const wallet = useMemo(() => {
        if (wallets.length === 0) 
            return null; 
        return wallets[0]
    }, [wallets, ready]);

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
            setSolBalance(walletBalance / 1e9 );
        } catch (err) {
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
        const allBalances = (
            await getAllTokenBalances.query({ address: wallet.address })
        );
        await refreshTokens(allBalances.map((balance) => balance.mint));
        const pertinentBalances = allBalances.filter(({mint}) => tokens[mint] != null);
        const balances = pertinentBalances.reduce((acc, balance) => {
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

    useEffect(() => {
    }, [wallet, authenticated]);

    return (
        <PortfolioContext.Provider
            value={{
                wallet,
                solBalance,
                isLoading,
                tokenBalances,
                refreshPortfolio,
                hasEnoughBalance,
            }}
        >
            {children}
        </PortfolioContext.Provider>
    );
};
