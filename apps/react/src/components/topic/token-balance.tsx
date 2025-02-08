import { Token } from "shared/src/types/token";
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
        <div className="card bg-white w-full p-4 shadow-sm rounded rounded-sm space-y-2">
            <div className="flex justify-between items-center">
                <p className="card-title text-primary">YOU OWN</p>
                <div className="text-right">
                    <p className="text-2xl font-extrabold">
                        {balance.toFixed(2)}
                    </p>
                    {mostRecentPrice && (
                        <p className="text-sm font-bold opacity-80">
                            ${(balance * mostRecentPrice).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
