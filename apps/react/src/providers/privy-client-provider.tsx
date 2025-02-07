
import { PrivyProvider } from '@privy-io/react-auth'; // TODO: make sure oslana walllets are loaded in



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
          theme: 'light',
          accentColor: '#16ff00',
          walletChainType: 'solana-only',
        }, 
      }}
    > 
      {children}
    </PrivyProvider>
  );
}