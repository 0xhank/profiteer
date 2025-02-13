import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { usePortfolio } from "../../hooks/usePortfolio";
import { Modal } from "../common/modal";

export function Account() {
    const { logout, connectWallet } = usePrivy();
    const { solBalance, wallet, tokenBalances } = usePortfolio();
    const [showQR, setShowQR] = useState(false);

    if (!wallet) {
        return (
            <button
                className="btn btn-accent rounded-none btn-sm"
                onClick={connectWallet}
            >
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
            <Modal.Button className="btn btn-accent h-8 px-2 rounded-sm">
                <p className="text-xs sm:text-lg text-gray-200 font-semibold">
                    {solBalance.toFixed(3)} SOL
                </p>
                <div className="hidden md:flex items-center gap-1">
                    <AccountIcon className="w-6 h-6" />
                </div>
            </Modal.Button>
            <Modal.Content className="w-[500px]">
                <div className="flex flex-col gap-4 p-4 bg-white ">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">
                            {wallet?.address.slice(0, 6)}...
                            {wallet?.address.slice(-6)}
                        </h3>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(
                                    wallet?.address || ""
                                );
                                toast.success("Address copied to clipboard");
                            }}
                            className="btn btn-ghost btn-xs"
                            title="Copy address"
                        >
                            <ClipboardIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowQR(true)}
                            className="btn btn-ghost btn-xs"
                            title="Show QR Code"
                        >
                            <QRIcon className="w-4 h-4" />
                        </button>
                        {showQR && (
                            <div
                                className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center"
                                onClick={() => setShowQR(false)}
                            >
                                <div
                                    className="bg-white p-8 rounded-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <QRCode
                                        value={wallet?.address || ""}
                                        size={256}
                                        level="H"
                                        fgColor="#000000"
                                        bgColor="#FFFFFF"
                                    />
                                    <p className="text-center text-sm text-gray-500">
                                        Scan to copy address
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="py-4 space-y-2">
                        <p className="label">Portfolio</p>
                        {[
                            ["SOL", solBalance],
                            ...Object.entries(tokenBalances),
                        ].map(([token, balance]) => (
                            <div
                                key={token}
                                className="flex items-center justify-between px-2"
                            >
                                <Link to={`/wiki/${token}`}>
                                    {token.slice(0, 6)}
                                </Link>
                                <span>{balance.toFixed(3)}</span>
                            </div>
                        ))}
                        <button onClick={logout} className="btn btn-error">
                            Logout
                        </button>
                    </div>
                </div>
            </Modal.Content>
        </Modal>
    );
}

const AccountIcon = ({ className }: { className?: string }) => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="200px"
        width="200px"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2ZM6.02332 15.4163C7.49083 17.6069 9.69511 19 12.1597 19C14.6243 19 16.8286 17.6069 18.2961 15.4163C16.6885 13.9172 14.5312 13 12.1597 13C9.78821 13 7.63095 13.9172 6.02332 15.4163ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"></path>
    </svg>
);
const ClipboardIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        stroke="currentColor"
        fill="currentColor"
        stroke-width="0"
        viewBox="0 0 384 512"
        height="200px"
        width="200px"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M384 112v352c0 26.51-21.49 48-48 48H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h80c0-35.29 28.71-64 64-64s64 28.71 64 64h80c26.51 0 48 21.49 48 48zM192 40c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24m96 114v-20a6 6 0 0 0-6-6H102a6 6 0 0 0-6 6v20a6 6 0 0 0 6 6h180a6 6 0 0 0 6-6z"></path>
    </svg>
);

const QRIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM19 19h2v2h-2zM15 19h2v2h-2zM13 21h2v2h-2zM21 13h2v2h-2z" />
    </svg>
);
