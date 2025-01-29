
import { PrivyProvider } from '@privy-io/react-auth'; // TODO: make sure oslana walllets are loaded in
import {toSolanaWalletConnectors} from '@privy-io/react-auth/solana';

const solanaConnectors = toSolanaWalletConnectors({
    // By default, shouldAutoConnect is enabled
    shouldAutoConnect: false,
  });

export function PrivyClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId="cl10000000000000000000000"
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          walletChainType: 'solana-only',
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