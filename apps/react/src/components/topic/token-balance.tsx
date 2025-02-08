import { Token } from "shared/src/types/token";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useSolPrice } from "../../hooks/useSolPrice";
import { useTokenBalance } from "../../hooks/useTokenBalance";
import { useTokenData } from "../../hooks/useTokenData";

interface TokenBalanceProps {
    token: Token;
}

export const TokenBalance = ({ token }: TokenBalanceProps) => {
    const { balance } = useTokenBalance(token.mint);
    const tokenData = useTokenData(token.mint);
    const mostRecentPrice = tokenData?.priceUsd;

    return (
        <div className="w-full">
            <div className="relative flex justify-between items-center pt-1">
                <p className="card-title text-primary">
                    {tokenData?.metadata.symbol} Balance
                </p>
                <div className="text-right">
                    <p className="text-lg font-extrabold">
                        {balance.toFixed(2)}
                    </p>
                    {mostRecentPrice && (
                        <p className="absolute right-0 -top-1 text-xs font-bold opacity-70">
                            ${(balance * mostRecentPrice).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const SolBalance = () => {
    const { solBalance } = usePortfolio();
    const { priceUsd } = useSolPrice();
    return (
        <div className="w-full">
            <div className="relative flex justify-between items-center pt-1">
                <p className="card-title text-primary">SOL Balance</p>
                <div className="text-right">
                    <p className="text-lg font-extrabold">
                        {solBalance.toFixed(5)}
                    </p>
                    {priceUsd && (
                        <p className="absolute right-0 -top-1 text-xs font-bold opacity-70">
                            ${(solBalance * priceUsd).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
