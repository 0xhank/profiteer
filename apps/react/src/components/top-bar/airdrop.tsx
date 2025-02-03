import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useServer } from "../../hooks/useServer";
import { usePortfolio } from "../../hooks/usePortfolio";

export const Airdrop = () => {
    const { authenticated } = usePrivy();
    const { getChainType } = useServer();

        const [type, setType] = useState<string>("");

        useEffect(() => {
            getChainType.query().then((type) => {
                setType(type);
            });
        }, []);

    if (!authenticated) return null;

    if (type === "local") return <AirdropLocal />;
    return <div>Airdrop {type}</div>;
};

const AirdropLocal = () => {
    const { getAirdrop } = useServer();
    const { walletAddress, refreshPortfolio } = usePortfolio();

    const handleAirdrop = async () => {
        if (!walletAddress) return;
        await getAirdrop.mutate({ address: walletAddress });
        await refreshPortfolio();
    }
    if (!walletAddress) return null;
    return <button className="btn btn-primary" onClick={handleAirdrop}>Airdrop</button>;
}