import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { Modal } from "../common/Modal";
import { useMemo } from "react";

export function Account() {
    const { login, logout, authenticated, user } = usePrivy();

    const { wallets } = useSolanaWallets();


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
            <Modal.Content className="w-[500px]">
                <div className="flex flex-col gap-4 p-4">
                <h3 className="font-bold text-lg">Account</h3>
                <div className="py-4 space-y-4">
                    {wallets.map((wallet) => (
                        <div className="flex items-center justify-between">
                            <span>{wallet.address}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between">
                        <span>Address</span>
                    </div>

                    <Modal.CloseButton className="btn btn-error w-full">
                        Disconnect
                    </Modal.CloseButton>
                </div>
                </div>
            </Modal.Content>
        </Modal>
    );
}
