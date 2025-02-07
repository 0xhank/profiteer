import { usePrivy } from "@privy-io/react-auth";
import { Modal } from "../common/Modal";

export function Account() {
    const { login, logout, authenticated, user } = usePrivy();

    if (!authenticated) {
        return (
            <button onClick={login} className="btn btn-primary">
                Connect Wallet
            </button>
        );
    }

    return (
        <Modal>
            <Modal.Button className="btn">Account</Modal.Button>
            <Modal.Content>
                <h3 className="font-bold text-lg">Account</h3>
                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span>Address</span>
                        <code className="bg-base-200 p-2 rounded">
                            {user?.wallet?.address}
                        </code>
                    </div>

                    <button onClick={logout} className="btn btn-error w-full">
                        Disconnect
                    </button>
                </div>
            </Modal.Content>
        </Modal>
    );
}
