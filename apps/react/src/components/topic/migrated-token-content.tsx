import { useToken } from "../../hooks/useToken";
import { LoadingPane } from "../common/loading";

export const MigratedTokenContent = ({ mint }: { mint: string }) => {
    const { token: tokenData } = useToken(mint);

    if (!tokenData) return <LoadingPane className="h-full" />;

    const fartcoin = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"
    return (
        tokenData && (
            <div className="col-span-1 flex flex-col gap-4 items-center">
                <iframe
                    src={`https://dexscreener.com/solana/${fartcoin}?embed=1&theme=light&trades=0&info=0`}
                    height="400px"
                    width="100%"
                />
            </div>
        )
    );
};
