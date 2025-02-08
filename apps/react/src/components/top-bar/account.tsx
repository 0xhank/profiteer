import { usePrivy } from "@privy-io/react-auth";
import { Modal } from "../common/modal";
import { usePortfolio } from "../../hooks/usePortfolio";
import { formatNumber } from "../../utils/formatPrice";

export function Account() {
    const { logout, connectWallet } = usePrivy();

    const { solBalance, wallet, tokenBalances } = usePortfolio();

    if (!wallet) {
        return (
            <button className="btn btn-secondary rounded-none btn-sm" onClick={connectWallet}>
                <div className="flex flex-col items-end">
                    <p className="text-lg text-gray-200 font-semibold">
                        Connect
                    </p>
                </div>
            </button>
        );
    }

    // show accounts
    return (
        <Modal>
            <Modal.Button className="btn btn-secondary btn-sm rounded-none">
                <div className="flex flex-col items-end">
                    <p className="text-lg text-gray-200 font-semibold">
                        {solBalance > 0 ? `${formatNumber(solBalance)} SOL`: "Deposit"} 
                    </p>
                </div>
            </Modal.Button>
            <Modal.Content className="w-[500px] ">
                <div className="flex flex-col gap-4 p-4 bg-base-100">
                    <h3 className="font-bold text-lg">Account</h3>
                    Wallet Address: {wallet?.address}
                    <div className="py-4 space-y-4">
                        Token Balances
                        {[
                            ["SOL", solBalance],
                            ...Object.entries(tokenBalances),
                        ].map(([token, balance]) => (
                            <div className="flex items-center justify-between">
                                <span>{token}</span>
                                <span>{balance}</span>
                            </div>
                        ))}
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
