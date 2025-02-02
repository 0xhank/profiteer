import { Token } from "shared/src/types/token";
import { useTokenBalance } from "../../hooks/useTokenBalance";

interface TokenBalanceProps {
  token: Token;
}

export const TokenBalance = ({ token }: TokenBalanceProps) => {
  const { balance } = useTokenBalance(token.mint);
  return (
    <div className="flex justify-between gap-16 bg-black p-2 items-center min-w-[400px]">
      <div className="flex flex-col gap-0">
        <p className="text-2xl text-pink-400 text-semi-bold">YOU OWN</p>
        <p
          className={
            "text-lg text-pink-400 dark:text-gray-400 -mt-2"
          }
        >
          あなたが所有する
        </p>
      </div>
        <p className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
          {balance.toFixed(2)} 
        </p>
    </div>
  );
};
