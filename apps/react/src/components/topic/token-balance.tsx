import { Token } from "shared/src/types/token";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useSolPrice } from "../../hooks/useSolPrice";
import { useToken } from "../../hooks/useToken";
import { useTokenBalance } from "../../hooks/useTokenBalance";

interface TokenBalanceProps {
    token: Token;
}

export const TokenBalance = ({ token }: TokenBalanceProps) => {
    const { balance } = useTokenBalance(token.mint);
    console.log("balance:", balance);
    const { token: tokenData } = useToken(token.mint);
    const mostRecentPrice = tokenData?.priceUsd;

    return (
        <div className="w-full">
            <div className="relative flex justify-between items-center pt-1">
                <p className="card-title text-primary">
                    {tokenData?.metadata.symbol} Balance
                </p>
                <div className="text-right">
                    {mostRecentPrice && (
                        <p className="text-xs font-bold opacity-70 -mb-1">
                            ${(balance * mostRecentPrice).toFixed(2)}
                        </p>
                    )}
                    <p className="text-lg font-extrabold">
                        {balance.toFixed(2)}
                    </p>
                    
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
            <div className="relative flex justify-between items-end pt-1">
                <p className="card-title text-primary">SOL Balance</p>
                <div className="text-right">
                    {priceUsd && (
                        <p className="text-xs font-bold opacity-70 -mb-1">
                            ${(solBalance * priceUsd).toFixed(2)}
                        </p>
                    )}
                    <p className="text-lg font-extrabold">
                        {solBalance.toFixed(5)}
                    </p>
                    
                </div>
            </div>
        </div>
    );
};
