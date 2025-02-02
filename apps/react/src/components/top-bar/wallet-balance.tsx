import { useFundWallet, useSolanaWallets } from "@privy-io/react-auth";
import { useEmbeddedWallet } from "../../hooks/useEmbeddedWallet";
import { useState } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useSolPrice } from "../../hooks/useSolPrice";
export const WalletBalance = () => {
  const { solBalance } = usePortfolio();

  return <div>
    <div>
      <p>
        {solBalance?.toFixed(3)} SOL
      </p>
    </div>
  </div>;
};
const WalletBalance1 = () => {
  // const { user, authenticated } = usePrivy();
  const { solBalance, isLoading } = usePortfolio();
  
  const [showModal, setShowModal] = useState(false);
  const { fundWallet } = useFundWallet();
  const embeddedWallet = useEmbeddedWallet();
  const { exportWallet } = useSolanaWallets();
  const { priceUSD } = useSolPrice();


  const handleDeposit = async () => {
    if (!embeddedWallet?.address) return;

    try {
      await fundWallet(embeddedWallet.address, {
        card: {
          preferredProvider: "moonpay",
        },
      });
    } catch (error) {
      console.error("Funding error:", error);
      setShowModal(false);
    }
  };

  const handleExportWallet = async () => {
    if (!embeddedWallet) {
      console.error("No embedded wallet found");
      return;
    }

    try {
      await exportWallet();
      setShowModal(false);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center h-full gap-4 px-3 py-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg animate-pulse" />
    );
  }

  if (solBalance === null) {
    return (
      <div className="flex items-center gap-4 px-4 py-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-gray-500">Connect</div>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex h-full items-center gap-6 sm:gap-4 px-3 py-1 cursor-pointer hover:bg-white/10"
        onClick={() => setShowModal(true)}
      >
        
        <div className="flex flex-col items-end bg-blue-900 rounded-full px-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white -mb-2">
            ${(solBalance * priceUSD).toFixed(2)}
          </p>
          <p className="text-md text-gray-200 font-semibold">
            {solBalance.toFixed(3)} SOL
          </p>
        </div>
          {/* {profilePicUrl && (
          <img
            src={profilePicUrl}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full w-12 h-12 border-2 border-white/80 shadow-md"
          /> */}
        {/* )} */}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-102 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                Account
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Sol Balance
              </p>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                ${(solBalance * priceUSD).toFixed(2)} USD
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {solBalance.toFixed(4)} SOL
              </p>
              {embeddedWallet?.address && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 break-all">
                  {embeddedWallet.address}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDeposit}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105"
              >
                Deposit
              </button>
              <button
                onClick={handleExportWallet}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Export Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
