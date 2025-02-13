import { VersionedTransaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Token } from "shared/src/types/token";
import { useFee } from "../../hooks/useFee";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";
import { useSolPrice } from "../../hooks/useSolPrice";
import { useToken } from "../../hooks/useToken";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { cn } from "../../utils/cn";
import { SolBalance, TokenBalance } from "./token-balance";
// Add these utility functions at the top level
const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
    return btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));
};

export const TokenTradeForm = ({
    tokenData,
    onSwap,
}: {
    tokenData: Token;
    onSwap: () => void;
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [amountIn, setAmountIn] = useState(1);
    const [isBuyMode, setIsBuyMode] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [maxSlippagePct, setMaxSlippagePct] = useState(() => {
        const stored = localStorage.getItem("maxSlippagePct");
        return stored ? Number(stored) : 20;
    });
    const { createSwapTx, sendSwapTx } = useServer();
    const { refreshPortfolio } = usePortfolio();
    const { balance: tokenBalance } = useTokenBalance(tokenData.mint);
    const { fee } = useFee(tokenData.mint);
    const { wallet } = usePortfolio();
    const { priceUsd: solPriceUsd } = useSolPrice();
    const {
        token: { priceUsd: tokenPriceUsd },
    } = useToken(tokenData.mint);

    const amountOut = useMemo(() => {
        if (!tokenPriceUsd || !solPriceUsd) return 0;
        const inPriceUsd = isBuyMode ? solPriceUsd : tokenPriceUsd;
        const outPriceUsd = isBuyMode ? tokenPriceUsd : solPriceUsd;
        const amountOut = (amountIn * inPriceUsd) / outPriceUsd;
        const amountOutWithFee = amountOut * (1 - fee);
        return amountOutWithFee;
    }, [amountIn, maxSlippagePct]);
    useEffect(() => {
        setAmountIn(1);
    }, [isBuyMode]);

    useEffect(() => {
        if (!wallet) {
            return;
        }
        setAmountIn(0);
    }, [wallet]);

    const handleExecute = async () => {
        if (!wallet) {
            return;
        }
        setIsLoading(true);
        const decimals = isBuyMode ? 9 : tokenData.metadata.decimals;
        const amountInAbs = BigInt(Math.round(amountIn * 10 ** decimals));
        const amountOutAbs = BigInt(Math.round(amountOut * 10 ** decimals));
        const minAmountOut =
            amountOutAbs *
            BigInt(Math.round(10000 - (maxSlippagePct * 100) / 10000));

        try {
            const pubKey = wallet.address;
            const { txId, txMessage } = await createSwapTx.query({
                userPublicKey: pubKey,
                mint: tokenData.mint,
                amount: amountInAbs.toString(),
                minAmountOut: minAmountOut.toString(),
                direction: isBuyMode ? "buy" : "sell",
            });

            const serializedTx = Buffer.from(txMessage, "base64");
            const tx = VersionedTransaction.deserialize(serializedTx);
            const signedTx = await wallet.signTransaction(tx);

            await sendSwapTx.mutate({
                txId,
                txMessage: uint8ArrayToBase64(signedTx.serialize()),
            });
            toast.success("Swap successful");

            // dont await this
            refreshPortfolio();
            onSwap();
        } catch (error) {
            toast.error(`Swap failed: ${error}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeMaxSlippagePct = (pct: number) => {
        setMaxSlippagePct(pct);
        localStorage.setItem("maxSlippagePct", pct.toString());
    };

    return (
        <div className="flex flex-col gap-2 w-full bg-white p-2 rounded-sm">
            <div className="flex justify-between items-center">
                {isBuyMode && <SolBalance />}
                {!isBuyMode && <TokenBalance token={tokenData} />}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setIsBuyMode(true)}
                    className={`btn rounded-sm flex-1 ${
                        isBuyMode ? "btn-accent" : "btn-secondary opacity-70"
                    }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setIsBuyMode(false)}
                    className={`btn rounded-sm flex-1 ${
                        !isBuyMode ? "btn-accent" : "btn-secondary opacity-70"
                    }`}
                >
                    Sell
                </button>
            </div>
            {isBuyMode && (
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => setAmountIn(0.1)}
                        className={`btn text-xs ${
                            amountIn === 0.1
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        }`}
                    >
                        0.1 SOL
                    </button>
                    <button
                        onClick={() => setAmountIn(1)}
                        className={`btn text-xs ${
                            amountIn === 1
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        }`}
                    >
                        1 SOL
                    </button>
                    <button
                        onClick={() => setAmountIn(5)}
                        className={`btn text-xs ${
                            amountIn === 5
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        }`}
                    >
                        5 SOL
                    </button>
                    <button
                        onClick={() => setAmountIn(10)}
                        className={`btn text-xs ${
                            amountIn === 10
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        }`}
                    >
                        10 SOL
                    </button>
                </div>
            )}
            {!isBuyMode && (
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => setAmountIn(tokenBalance * 0.25)}
                        className={cn(
                            "btn text-xs",
                            amountIn === tokenBalance * 0.25
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        )}
                    >
                        25%
                    </button>
                    <button
                        onClick={() => setAmountIn(tokenBalance * 0.5)}
                        className={cn(
                            "btn text-xs",
                            amountIn === tokenBalance * 0.5
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        )}
                    >
                        50%
                    </button>
                    <button
                        onClick={() => setAmountIn(tokenBalance * 0.75)}
                        className={cn(
                            "btn text-xs",
                            amountIn === tokenBalance * 0.75
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        )}
                    >
                        75%
                    </button>
                    <button
                        onClick={() => setAmountIn(tokenBalance)}
                        className={cn(
                            "btn text-xs",
                            amountIn === tokenBalance
                                ? "btn-accent"
                                : "btn-secondary opacity-70"
                        )}
                    >
                        100%
                    </button>
                </div>
            )}
            <input
                type="number"
                value={amountIn}
                onChange={(e) => setAmountIn(Number(e.target.value))}
                className="input input-neutral w-full bg-gray-100"
                placeholder="Enter amount"
            />

            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <button
                    onClick={handleExecute}
                    disabled={isLoading || !wallet}
                    className="btn btn-primary"
                >
                    {!wallet
                        ? "Login to trade"
                        : isLoading
                        ? "Processing..."
                        : "Confirm"}
                </button>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="btn btn-ghost btn-sm"
                >
                    <SettingsIcon className="w-4 h-4" />
                </button>
            </div>
            {showSettings && (
                <div className="bg-gray-100 p-2 rounded-sm">
                    <label className="text-sm font-medium">
                        <p>Max Slippage  ({maxSlippagePct}%)</p>
                    </label>
                    <input
                        type="range"
                        min={0.5}
                        max={50}
                        step={0.5}
                        value={maxSlippagePct}
                            onChange={(e) =>
                                handleChangeMaxSlippagePct(
                                    Number(e.target.value)
                                )
                        }
                        className="range range-secondary"
                    />
                </div>
            )}
        </div>
    );
};

const SettingsIcon = ({ className }: { className: string }) => {
    return (
        <svg
            stroke="currentColor"
            className={className}
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="200px"
            width="200px"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M413.967 276.8c1.06-6.235 1.06-13.518 1.06-20.8s-1.06-13.518-1.06-20.8l44.667-34.318c4.26-3.118 5.319-8.317 2.13-13.518L418.215 115.6c-2.129-4.164-8.507-6.235-12.767-4.164l-53.186 20.801c-10.638-8.318-23.394-15.601-36.16-20.801l-7.448-55.117c-1.06-4.154-5.319-8.318-10.638-8.318h-85.098c-5.318 0-9.577 4.164-10.637 8.318l-8.508 55.117c-12.767 5.2-24.464 12.482-36.171 20.801l-53.186-20.801c-5.319-2.071-10.638 0-12.767 4.164L49.1 187.365c-2.119 4.153-1.061 10.399 2.129 13.518L96.97 235.2c0 7.282-1.06 13.518-1.06 20.8s1.06 13.518 1.06 20.8l-44.668 34.318c-4.26 3.118-5.318 8.317-2.13 13.518L92.721 396.4c2.13 4.164 8.508 6.235 12.767 4.164l53.187-20.801c10.637 8.318 23.394 15.601 36.16 20.801l8.508 55.117c1.069 5.2 5.318 8.318 10.637 8.318h85.098c5.319 0 9.578-4.164 10.638-8.318l8.518-55.117c12.757-5.2 24.464-12.482 36.16-20.801l53.187 20.801c5.318 2.071 10.637 0 12.767-4.164l42.549-71.765c2.129-4.153 1.06-10.399-2.13-13.518l-46.8-34.317zm-158.499 52c-41.489 0-74.46-32.235-74.46-72.8s32.971-72.8 74.46-72.8 74.461 32.235 74.461 72.8-32.972 72.8-74.461 72.8z"></path>
        </svg>
    );
};
