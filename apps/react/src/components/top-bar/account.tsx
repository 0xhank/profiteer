import { usePrivy } from "@privy-io/react-auth";
import { Modal } from "../common/modal";
import { usePortfolio } from "../../hooks/usePortfolio";

export function Account() {
    const { login, logout, authenticated } = usePrivy();

    const { tokenBalances, wallet, solBalance } = usePortfolio();

    if (!authenticated) {
        return (
            <button onClick={login} className="btn btn-primary">
                Connect Wallet
            </button>
        );
    }

    // show accounts
    return (
        <Modal>
            <Modal.Button className="btn btn-primary">Account</Modal.Button>
            <Modal.Content className="w-[500px] ">
                <div className="flex flex-col gap-4 p-4 bg-base-100">
                    <h3 className="font-bold text-lg">Account</h3>
                    Wallet Address: {wallet?.address}
                    <div className="py-4 space-y-4">
                        Token Balances
                        {[["SOL", solBalance], ...Object.entries(tokenBalances)].map(
                            ([token, balance]) => (
                                <div className="flex items-center justify-between">
                                    <span>{token}</span>
                                    <span>{balance}</span>
                                </div>
                            )
                        )}
                        <button
                            onClick={logout}
                            className="btn btn-error w-full"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );
}
