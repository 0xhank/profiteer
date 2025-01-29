import { useSolanaWallets } from '@privy-io/react-auth/solana';

export const useEmbeddedWallet = () => {
  const { wallets } = useSolanaWallets();
  
  // Find the embedded wallet
  const embeddedWallet = wallets.find(
    wallet => wallet.walletClientType === 'privy'
  );

  return embeddedWallet;
}; 