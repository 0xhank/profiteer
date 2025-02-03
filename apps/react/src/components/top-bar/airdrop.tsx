import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useServer } from "../../hooks/useServer";
import { useFundWallet } from "@privy-io/react-auth/solana";


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
    if (type === "devnet") return <AirdropDevnet />;
    if (type === "mainnet") return <AirdropMainnet />;
    return <div>Airdrop {type}</div>;
};

const AirdropLocal = () => {
    const { getAirdrop } = useServer();
    const { wallet, refreshPortfolio } = usePortfolio();

    const handleAirdrop = async () => {
        if (!wallet) return;
        await getAirdrop.mutate({ address: wallet.address });
        await refreshPortfolio();
    };
    if (!wallet) return null;
    return (
        <button className="btn btn-primary" onClick={handleAirdrop}>
            Airdrop
        </button>
    );
};

const AirdropDevnet = () => {
    const { wallet } = usePortfolio();

    const handleAirdrop = async () => {
        if (!wallet) return;
        // Copy wallet address to clipboard
        await navigator.clipboard.writeText(wallet.address);
        window.open("https://faucet.solana.com/", "_blank");
    };

    if (!wallet) return null;
    return (
        <button className="btn btn-primary" onClick={handleAirdrop}>
            Get Devnet SOL
        </button>
    );
};

const AirdropMainnet = () => {
    const { wallet, refreshPortfolio } = usePortfolio();
    const { fundWallet } = useFundWallet();

    const handleAirdrop = async () => {
        if (!wallet) return;
        await fundWallet(wallet.address);
        await refreshPortfolio();
    };

    if (!wallet) return null;
    return (
        <button className="btn btn-primary" onClick={handleAirdrop}>
            Fund Wallet
        </button>
    );
};
