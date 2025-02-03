import { useState } from "react";
import { Token } from "shared/src/types/token";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { useFee } from "../../hooks/useFee";

export const TokenTradeForm = ({ tokenData, onSwap }: { tokenData: Token, onSwap: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [amount, setAmount] = useState(1);
    const [isBuyMode, setIsBuyMode] = useState(true);
    const [maxSlippagePct, setMaxSlippagePct] = useState(20);
    const { swap } = useServer();
    const { refreshPortfolio } = usePortfolio();
    const { balance: tokenBalance } = useTokenBalance(tokenData.mint);
    const { fee } = useFee(tokenData.mint);

    const handleExecute = async () => {
        setIsLoading(true);
        const decimals = isBuyMode ? 9 : tokenData.metadata.decimals;
        const amountIn = BigInt(Math.round(amount)) * BigInt(10 ** decimals);
        const minAmountOut =
            amountIn * BigInt(Math.round(100 - maxSlippagePct / 10000));



        try {
            await swap.mutate({
                mint: tokenData.mint,
                amount: amountIn.toString(),
                minAmountOut: "0",
                direction: isBuyMode ? "buy" : "sell",
            });

            // dont await this
            refreshPortfolio();
            onSwap();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-0 w-full">
            <div className="flex space-x-0">
                <button
                    onClick={() => setIsBuyMode(true)}
                    className={`btn btn-primary flex-1 ${
                        isBuyMode ? "border-2 border-accent " : ""
                    }`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setIsBuyMode(false)}
                    className={`btn btn-secondary flex-1 ${
                        !isBuyMode ? "border-2 border-accent" : ""
                    }`}
                >
                    Sell
                </button>
            </div>
            {isBuyMode && (
                <div className="flex space-x-2 mt-2">
                    <button
                        onClick={() => setAmount(1)}
                        className="btn btn-outline"
                    >
                        1 SOL
                    </button>
                    <button
                        onClick={() => setAmount(5)}
                        className="btn btn-outline"
                    >
                        5 SOL
                    </button>
                    <button
                        onClick={() => setAmount(10)}
                        className="btn btn-outline"
                    >
                        10 SOL
                    </button>
                </div>
            )}
            {!isBuyMode && (
                <div className="flex space-x-2 mt-2">
                    <button
                        onClick={() => setAmount(tokenBalance * 0.25)}
                        className="btn btn-outline"
                    >
                        25%
                    </button>
                    <button
                        onClick={() => setAmount(tokenBalance * 0.5)}
                        className="btn btn-outline"
                    >
                        50%
                    </button>
                    <button
                        onClick={() => setAmount(tokenBalance * 0.75)}
                        className="btn btn-outline"
                    >
                        75%
                    </button>
                    <button
                        onClick={() => setAmount(tokenBalance)}
                        className="btn btn-outline"
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
 <div className="flex flex-col gap-2">
                    <p>Fee: {fee * 100}%</p>
                </div>
            <button
                onClick={handleExecute}
                disabled={isLoading}
                className="btn btn-accent"
            >
                {isLoading ? "Processing..." : "Confirm"}
            </button>
        </div>
    );
};
