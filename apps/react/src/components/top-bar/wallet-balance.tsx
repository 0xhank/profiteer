import { usePrivy } from "@privy-io/react-auth";
import { usePortfolio } from "../../hooks/usePortfolio";
import { Account } from "./account";

export const WalletBalance = () => {
    const { isLoading } = usePortfolio();
    const { login, ready, authenticated } = usePrivy();

    if (isLoading || !ready) {
        return null;
    }

    return (
        <div className="flex h-full justify-end items-center gap-6 sm:gap-4">
            {authenticated && <Account />}
            {!authenticated && (
                <button
                    className="btn btn-accent text-white w-fit rounded-none"
                    onClick={login}
                >
                    Login
                </button>
            )}
        </div>
    );
};
