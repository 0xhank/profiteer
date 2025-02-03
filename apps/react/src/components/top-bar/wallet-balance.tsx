import { useFundWallet, usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useEmbeddedWallet } from "../../hooks/useEmbeddedWallet";
import { useState } from "react";
import { usePortfolio } from "../../hooks/usePortfolio";
import { useSolPrice } from "../../hooks/useSolPrice";

export const WalletBalance = () => {
  const { solBalance, isLoading } = usePortfolio();
  const { login, authenticated,ready } = usePrivy();

  const { fundWallet } = useFundWallet();
  const embeddedWallet = useEmbeddedWallet();
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
    }
  };

 

  if (isLoading || !ready) {
    return (
      null
    );
  }

  if (!authenticated) {
    return (
      <button className="btn btn-primary mr-4" onClick={login}>
        <div className="text-gray-500">Connect</div>
      </button>
    );
  }

  return (
    <>
      <div
        className="flex h-full items-center gap-6 sm:gap-4 px-3 py-1"
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


    </>
  );
};
