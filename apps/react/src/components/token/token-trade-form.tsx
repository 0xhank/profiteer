import { useState } from "react";
import { Token } from "shared/src/types/token";

export const TokenTradeForm = (tokenData: Token) => {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [isBuyMode, setIsBuyMode] = useState(true);

  const handleBuy = async () => {
    setIsLoading(true);
    console.log("Buying token", tokenData, "Amount:", amount);
    setIsLoading(false);
  };

  const handleSell = async () => {
    setIsLoading(true);
    console.log("Selling token", tokenData, "Amount:", amount);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-0 w-[500px]">
      <div className="flex space-x-0">
        <button
          onClick={() => setIsBuyMode(true)}
          className={`flex-1 px-4 py-2 ${
            isBuyMode
              ? "bg-blue-500 hover:bg-blue-600 border border-white border-2"
              : "bg-transparent"
          } text-white font-bold transition-all duration-300`}
        >
          Buy
        </button>
        <button
          onClick={() => setIsBuyMode(false)}
          className={`flex-1 px-4 py-2 ${
            !isBuyMode
              ? "bg-red-500 hover:bg-red-600 border border-white border-2"
              : "bg-transparent"
          } text-white font-bold transition-all duration-300`}
        >
          Sell
        </button>
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full px-4 py-2 border bg-white"
        placeholder="Enter amount"
      />
      <button
        onClick={isBuyMode ? handleBuy : handleSell}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Confirm"}
      </button>
    </div>
  );
};
// const handleBuy = async (buyAmountInSOL: number) => {
//   setIsLoading(true);
//   try {
//     const priorityFee = 0.005; // 0.005 SOL
//     const requiredAmount = buyAmountInSOL + priorityFee;

//     // Check if wallet has enough balance
//     if (!hasEnoughBalance(requiredAmount)) {
//       await fundWallet(embeddedWallet.address, {
//         amount: requiredAmount.toString(),
//         card: {
//           preferredProvider: 'moonpay',
//         },
//       });
//       setIsLoading(false);
//       return;
//     }

//     // Get buy transaction from backend
//     const response = await fetch('https://tokenize-me-backend.onrender.com/api/buy-token', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         publicKey: embeddedWallet.address,
//         tokenAddress: displayedUserToken.token_address,
//         amountInSol: buyAmountInSOL,
//         slippage: 10,
//         priorityFee: priorityFee
//       }),
//     });

//     const data: BuyTokenResponse = await response.json();

//     if (data.status === 'success' && data.transaction) {
//       // Convert base64 to Uint8Array
//       const transactionBuffer = Uint8Array.from(
//         Buffer.from(data.transaction, 'base64')
//       );

//       if (transactionBuffer.length === 0) {
//         throw new Error('Received empty transaction data');
//       }

//       // Deserialize transaction
//       const transaction = VersionedTransaction.deserialize(transactionBuffer);

//       // Setup connection
//       const connection = new Connection(
//         'https://special-yolo-butterfly.solana-mainnet.quiknode.pro/ebf72b17cd8c4be0b4ae113cd927b3803d793c17',
//         'confirmed'
//       );

//       // Send transaction through Privy
//       await sendTransaction({
//         transaction,
//         connection
//       });

//     } else {
//       throw new Error(data.message || 'Failed to create buy transaction');
//     }
//   } catch (error) {
//     console.error('Error buying token:', error);
//   } finally {
//     setIsLoading(false);
//   }
// };
