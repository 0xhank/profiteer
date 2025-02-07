import {
    usePrivy,
    useSolanaWallets,
} from "@privy-io/react-auth";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useSolPrice } from "../../hooks/useSolPrice";
import { Airdrop } from "./airdrop";
import { Account } from "./account";

export const WalletBalance = () => {
    const { solBalance, isLoading, wallet, refreshPortfolio } =
        usePortfolio();
    const { login, logout, authenticated, ready } = usePrivy();

    const { createWallet } = useSolanaWallets();

    const { priceUSD } = useSolPrice();

    if (isLoading || !ready) {
        return null;
    }

    if (!authenticated) {
        return (
            <button className="btn btn-primary mr-4" onClick={login}>
                <div className="text-gray-500">Login</div>
            </button>
        );
    }

    return (
        <>
        <div className="flex h-full items-center gap-6 sm:gap-4 px-3 py-1">
            {!wallet && (
                <button className="btn btn-primary mr-4" onClick={createWallet}>
                    <div className="text-gray-500">Connect</div>
                </button>
            )}
            {wallet && (
                <div className="flex flex-row items-center gap-12">
                    <p>{wallet.address}</p>
                    <Airdrop />

                    <Account />
                    <div className="flex flex-row items-center bg-primary rounded-full px-4">
                        <button
                            onClick={refreshPortfolio}
                            className="btn btn-ghost p-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                        </button>
                        <div className="flex flex-col items-end">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white -mb-2">
                                ${(solBalance * priceUSD).toFixed(2)}
                            </p>
                            <p className="text-md text-gray-200 font-semibold">
                                {solBalance.toFixed(3)} SOL
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <button
                onClick={logout}
                className="btn btn-secondary"
            >
                Logout
            </button>
        </div>
       </> 
    );
};
