  const handleBuy = async (buyAmountInSOL: number) => {

    if (!tokenAddress || !embeddedWallet?.address) return;
    
    setIsLoading(true);
    try {
      const priorityFee = 0.005; // 0.005 SOL
      const requiredAmount = buyAmountInSOL + priorityFee;

      // Check if wallet has enough balance
      if (!hasEnoughBalance(requiredAmount)) {
        await fundWallet(embeddedWallet.address, {
          amount: requiredAmount.toString(),
          card: {
            preferredProvider: 'moonpay',
          },
        });
        setIsLoading(false);
        return;
      }

      // Get buy transaction from backend
      const response = await fetch('https://tokenize-me-backend.onrender.com/api/buy-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: embeddedWallet.address,
          tokenAddress: displayedUserToken.token_address,
          amountInSol: buyAmountInSOL,
          slippage: 10,
          priorityFee: priorityFee
        }),
      });

      const data: BuyTokenResponse = await response.json();

      if (data.status === 'success' && data.transaction) {
        // Convert base64 to Uint8Array
        const transactionBuffer = Uint8Array.from(
          Buffer.from(data.transaction, 'base64')
        );

        if (transactionBuffer.length === 0) {
          throw new Error('Received empty transaction data');
        }

        // Deserialize transaction
        const transaction = VersionedTransaction.deserialize(transactionBuffer);

        // Setup connection
        const connection = new Connection(
          'https://special-yolo-butterfly.solana-mainnet.quiknode.pro/ebf72b17cd8c4be0b4ae113cd927b3803d793c17',
          'confirmed'
        );

        // Send transaction through Privy
        await sendTransaction({
          transaction,
          connection
        });

      } else {
        throw new Error(data.message || 'Failed to create buy transaction');
      }
    } catch (error) {
      console.error('Error buying token:', error);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };