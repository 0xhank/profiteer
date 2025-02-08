import { VersionedTransaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Token } from "shared/src/types/token";
import { useFee } from "../../hooks/useFee";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";
import { useTokenBalance } from "../../hooks/useTokenBalance";
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
    const [amount, setAmount] = useState(1);
    const [isBuyMode, setIsBuyMode] = useState(true);
    const [maxSlippagePct, setMaxSlippagePct] = useState(20);
    const { createSwapTx, sendSwapTx } = useServer();
    const { refreshPortfolio } = usePortfolio();
    const { balance: tokenBalance } = useTokenBalance(tokenData.mint);
    const { fee } = useFee(tokenData.mint);
    const { wallet } = usePortfolio();

    useEffect(() => {
        setAmount(0);
    }, [isBuyMode]);

    const handleExecute = async () => {
        if (!wallet) {
            return;
        }
        setIsLoading(true);
        const decimals = isBuyMode ? 9 : tokenData.metadata.decimals;
        const amountIn = BigInt(Math.round(amount * 10 ** decimals));
        const minAmountOut =
            amountIn * BigInt(Math.round(100 - maxSlippagePct / 10000));

        try {
            const pubKey = wallet.address;
            const { txId, txMessage } = await createSwapTx.query({
                userPublicKey: pubKey,
                mint: tokenData.mint,
                amount: amountIn.toString(),
                minAmountOut: "0",
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
        <div className="flex flex-col gap-2 w-full border border-black/30 p-2">
            {isBuyMode && <SolBalance />}
            {!isBuyMode && <TokenBalance token={tokenData} />}
            <div className="flex gap-2">
                <button
                    onClick={() => setIsBuyMode(true)}
                    className={`btn  rounded-none flex-1 ${
                        isBuyMode ? "btn-accent" : "btn-outline"
                    }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setIsBuyMode(false)}
                    className={`btn rounded-none flex-1 ${
                        !isBuyMode ? "btn-accent" : "btn-outline"
                    }`}
                >
                    Sell
                </button>
            </div>
            {isBuyMode && (
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => setAmount(0.1)}
                        className={`btn rounded-none  ${
                            amount === 0.1
                                ? "btn-ghost ring-2 ring-accent"
                                : "btn-outline"
                        }`}
                    >
                        0.1 SOL
                    </button>
                    <button
                        onClick={() => setAmount(1)}
                        className={`btn rounded-none  ${
                            amount === 1
                                ? "btn-ghost ring-2 ring-accent"
                                : "btn-outline"
                        }`}
                    >
                        1 SOL
                    </button>
                    <button
                        onClick={() => setAmount(5)}
                        className={`btn rounded-none  ${
                            amount === 5
                                ? "btn-ghost ring-2 ring-accent"
                                : "btn-outline"
                        }`}
                    >
                        5 SOL
                    </button>
                    <button
                        onClick={() => setAmount(10)}
                        className={`btn rounded-none  ${
                            amount === 10
                                ? "btn-ghost ring-2 ring-accent"
                                : "btn-outline"
                        }`}
                    >
                        10 SOL
                    </button>
                </div>
            )}
            {!isBuyMode && (
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => setAmount(tokenBalance * 0.25)}
                        className={
                            amount === tokenBalance * 0.25
                                ? "btn rounded-none btn-ghost ring-2 ring-accent"
                                : "btn rounded-none btn-outline"
                        }
                    >
                        25%
                    </button>
                    <button
                        onClick={() => setAmount(tokenBalance * 0.5)}
                        className={
                            amount === tokenBalance * 0.5
                                ? "btn rounded-none btn-ghost ring-2 ring-accent"
                                : "btn rounded-none btn-outline"
                        }
                    >
                        50%
                    </button>
                    <button
                        onClick={() => setAmount(tokenBalance * 0.75)}
                        className={
                            amount === tokenBalance * 0.75
                                ? "btn rounded-none btn-ghost ring-2 ring-accent"
                                : "btn rounded-none btn-outline"
                        }
                    >
                        75%
                    </button>
                    <button
                        onClick={() => setAmount(tokenBalance)}
                        className={
                            amount === tokenBalance
                                ? "btn rounded-none btn-ghost ring-2 ring-accent"
                                : "btn rounded-none btn-outline"
                        }
                    >
                        100%
                    </button>
                </div>
            )}
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border bg-white"
                placeholder="Enter amount"
            />
            {/* {fee > 0.01 && ( */}
                
            {/* // )} */}
            <button
                onClick={handleExecute}
                disabled={isLoading}
                className="btn btn-primary rounded-none"
            >
                {isLoading ? "Processing..." : "Confirm"}
            </button>
        </div>
    );
};
