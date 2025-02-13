import { VersionedTransaction } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Token } from "shared/src/types/token";
import { useFee } from "../../hooks/useFee";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { SolBalance, TokenBalance } from "./token-balance";
import { cn } from "../../utils/cn";
import { usePrivy } from "@privy-io/react-auth";
import { useSolPrice } from "../../hooks/useSolPrice";
import { useToken } from "../../hooks/useToken";
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

    const { authenticated } = usePrivy();
    const [isLoading, setIsLoading] = useState(false);
    const [amountIn, setAmountIn] = useState(1);
    const [isBuyMode, setIsBuyMode] = useState(true);
    const [maxSlippagePct, setMaxSlippagePct] = useState(20);
    const { createSwapTx, sendSwapTx } = useServer();
    const { refreshPortfolio } = usePortfolio();
    const { balance: tokenBalance } = useTokenBalance(tokenData.mint);
    const { fee } = useFee(tokenData.mint);
    const { wallet } = usePortfolio();
    const {priceUsd: solPriceUsd } =useSolPrice();
    const {token: {priceUsd: tokenPriceUsd}} = useToken(tokenData.mint)

    const amountOut = useMemo(() => {
        if (!tokenPriceUsd || !solPriceUsd) return 0;
        const inPriceUsd= isBuyMode ? solPriceUsd : tokenPriceUsd;
        const outPriceUsd= isBuyMode ? tokenPriceUsd : solPriceUsd;
        const amountOut = amountIn * inPriceUsd / outPriceUsd;
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
        const minAmountOut = amountOutAbs * BigInt(Math.round(10000 - maxSlippagePct * 100 / 10000));

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

    return (
        <div className="flex flex-col gap-2 w-full bg-white p-2 rounded-sm ">
            {isBuyMode && <SolBalance />}
            {!isBuyMode && <TokenBalance token={tokenData} />}
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
           
            <button
                onClick={handleExecute}
                disabled={isLoading || !authenticated}
                className="btn btn-primary btn-block"
            >
                {!authenticated ? "Login to trade" : isLoading ? "Processing..." : "Confirm"}
            </button>
        </div>
    );
};
