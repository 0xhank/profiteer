import { useEmbeddedWallet } from "../../hooks/useEmbeddedWallet";

export const SendTransactionButton = () => {
  const embeddedWallet = useEmbeddedWallet();
  if (!embeddedWallet?.address) {
    return <button disabled>Connect wallet</button>;
  }

  const onSendTransaction = async () => {
    console.log("Sending transaction");
  };

  return (
    <button
      onClick={onSendTransaction}
      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold hover:scale-105 transform transition-all duration-300 shadow-lg"
    >
      Create Token
    </button>
  );
}