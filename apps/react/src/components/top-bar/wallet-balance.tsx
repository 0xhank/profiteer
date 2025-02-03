import { useFundWallet, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useEmbeddedWallet } from "../../hooks/useEmbeddedWallet";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useSolPrice } from "../../hooks/useSolPrice";

export const WalletBalance = () => {
    const { solBalance, isLoading, walletAddress } = usePortfolio();
    const {
        login,
        logout,
        connectWallet,
        authenticated,
        ready,
    } = usePrivy();

    const { fundWallet } = useFundWallet();
    const {createWallet} = useSolanaWallets();

    const embeddedWallet = useEmbeddedWallet();
    const { priceUSD } = useSolPrice();

    const handleDeposit = async () => {
        if (!embeddedWallet?.address) return;

        try {
            await fundWallet(embeddedWallet.address, {
                card: {
                    preferredProvider: "moonpay",
                },
            });
        } catch (error) {
            console.error("Funding error:", error);
        }
    };

    if (isLoading || !ready) {
        return null;
    }

    if (!authenticated) {
        return (
            <button
                className="btn btn-primary mr-4"
                onClick={login}
            >
                <div className="text-gray-500">Login</div>
            </button>
        );
    }

    return (
        <div className="flex h-full items-center gap-6 sm:gap-4 px-3 py-1">
            {!walletAddress && (
                <button
                    className="btn btn-primary mr-4"
                    onClick={createWallet}
                >
                    <div className="text-gray-500">Connect</div>
                </button>
            )}
            {walletAddress && (
                <div className="flex flex-col items-end bg-blue-900 rounded-full px-4">
                    <div className="flex flex-col items-end bg-blue-900 rounded-full px-4">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white -mb-2">
                            ${(solBalance * priceUSD).toFixed(2)}
                        </p>
                        <p className="text-md text-gray-200 font-semibold">
                            {solBalance.toFixed(3)} SOL
                        </p>
                    </div>
                </div>
            )}
            <button
                onClick={logout}
                className="btn btn-ghost text-gray-400 hover:text-gray-200"
            >
                Logout
            </button>
        </div>
    );
};
