import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const solanaConnectors = toSolanaWalletConnectors({
    shouldAutoConnect: true,
});

export function PrivyClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PrivyProvider
            appId="cm6pbbrvi00d1ie7frudjs2pq"
            config={{
                appearance: {
                    theme: "light",
                    accentColor: "#16ff00",
                    walletChainType: "solana-only",
                },
                externalWallets: {
                    solana: {
                        connectors: solanaConnectors,
                    },
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}
