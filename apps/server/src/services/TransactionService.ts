import { createCloseAccountInstruction } from "@solana/spl-token";
import {
  AddressLookupTableAccount,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  MessageV0,
  PublicKey,
  TransactionConfirmationStatus,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
  SignatureStatus,
} from "@solana/web3.js";
import bs58 from "bs58";
import {
  ATA_PROGRAM_PUBLIC_KEY,
  MAX_CHAIN_COMPUTE_UNITS,
  TOKEN_PROGRAM_PUBLIC_KEY,
} from "../constants/tokens";

import { SubmitSignedTransactionResponse, TransactionRegistryData, TransactionRegistryEntry } from "@/types";

/**
 * Service for handling all transaction-related operations
 */
export class TransactionService {
  private messageRegistry: Map<string, TransactionRegistryEntry> = new Map();

  private cleanupInterval: number = 5000;
  private registryTimeout: number = 60000;
  private confirmAttempts: number = 10;
  private confirmAttemptDelay: number = 500;
  private maxSimAttempts: number = 3;
  private maxComputePrice: number = 1000000;
  private autoPriorityFeeMultiplier: number = 2;

  constructor(
    private connection: Connection,
    private feePayerKeypair: Keypair,
  ) {
    this.initializeCleanup();
  }

  // ----------- Initialization ------------

  private initializeCleanup(): void {
    (async () => {
      setInterval(() => this.cleanupRegistry(), this.cleanupInterval);
    })();
  }

  private async cleanupRegistry() {
    const now = Date.now();
    for (const [key, value] of this.messageRegistry.entries()) {
      if (now - value.timestamp > this.registryTimeout) {
        this.messageRegistry.delete(key);
      }
    }
  }

  // ----------- Transaction Registry ------------

  /**
   * Gets a registered transaction from the registry
   */
  getRegisteredTransaction(base64Message: string): TransactionRegistryEntry | undefined {
    return this.messageRegistry.get(base64Message);
  }

  /**
   * Removes a transaction from the registry
   */
  deleteFromRegistry(base64Message: string): void {
    this.messageRegistry.delete(base64Message);
  }

  /**
   * Registers a transaction message in the registry
   */
  registerTransaction(
    message: MessageV0,
    lastValidBlockHeight: number,
    autoSlippage: boolean,
    contextSlot: number,
    buildAttempts: number,
  ): string {
    const base64Message = Buffer.from(message.serialize()).toString("base64");
    this.messageRegistry.set(base64Message, {
      message,
      lastValidBlockHeight,
      timestamp: Date.now(),
      autoSlippage,
      contextSlot,
      buildAttempts,
    });
    return base64Message;
  }

  // ----------- Transaction Operations ------------

  /**
   * Builds a transaction message from instructions and registers it in the registry
   */
  async buildAndRegisterTransactionMessage(
    instructions: TransactionInstruction[],
    addressLookupTableAccounts: AddressLookupTableAccount[],
    txRegistryData: TransactionRegistryData,
  ): Promise<string> {
    const { message, lastValidBlockHeight } = await this.buildTransactionMessage(
      instructions,
      addressLookupTableAccounts,
    );

    // Register transaction
    const base64Message = this.registerTransaction(
      message,
      lastValidBlockHeight,
      txRegistryData.autoSlippage,
      txRegistryData.contextSlot,
      txRegistryData.buildAttempts,
    );

    return base64Message;
  }

  /**
   * Builds a transaction message from instructions
   */
  async buildTransactionMessage(
    instructions: TransactionInstruction[],
    addressLookupTableAccounts: AddressLookupTableAccount[],
  ): Promise<{ message: MessageV0; blockhash: string; lastValidBlockHeight: number }> {
    const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();

    const message = new TransactionMessage({
      payerKey: this.feePayerKeypair.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message(addressLookupTableAccounts);

    try {
      message.serialize();
    } catch (error) {
      console.error("[buildTransactionMessage] Failed to serialize message:", error);
      throw error;
    }

    return { message, blockhash, lastValidBlockHeight };
  }

  /**
   * Signs a transaction with the fee payer
   */
  async signTransaction(transaction: VersionedTransaction): Promise<string> {
    try {
      transaction.sign([this.feePayerKeypair]);
      const signature = transaction.signatures[0];
      if (!signature) {
        throw new Error("No signature found after signing");
      }
      return bs58.encode(signature);
    } catch (e) {
      console.error("[signTransaction] Error signing transaction:", e);
      throw new Error("Failed to sign transaction");
    }
  }

  /**
   * Signs and sends a transaction
   */
  async signAndSendTransaction(
    userPublicKey: PublicKey,
    userSignature: string,
    entry: TransactionRegistryEntry,
  ): Promise<SubmitSignedTransactionResponse> {
    const transaction = new VersionedTransaction(entry.message);

    // Add user signature
    const userSignatureBytes = Buffer.from(userSignature, "base64");
    transaction.addSignature(userPublicKey, userSignatureBytes);

    // Add fee payer signature
    const feePayerSignature = await this.signTransaction(transaction);
    const feePayerSignatureBytes = Buffer.from(bs58.decode(feePayerSignature));
    transaction.addSignature(this.feePayerKeypair.publicKey, feePayerSignatureBytes);

    let txid: string = "";

    try {
      console.log("Signature Verification + Slippage Simulation");

      // resimulating, not rebuilding
      const simulation = await this.simulateTransactionWithResim(transaction, entry.contextSlot, true, false);
      if (simulation.value?.err) {
        throw new Error(JSON.stringify(simulation.value.err));
      }

      // Send transaction
      txid = await this.connection.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: "processed",
        minContextSlot: entry.contextSlot,
      });
    } catch (error) {
      console.log("Tx send failed: " + JSON.stringify(error));
      throw new Error(JSON.stringify(error));
    }

    // tx confirmation and resend case
    try {
      const confirmation = await this.confirmTransaction(txid, entry.lastValidBlockHeight);
      const base64Message = Buffer.from(entry.message.serialize()).toString("base64");
      this.deleteFromRegistry(base64Message);
      let timestamp: number | null = null;
      if (confirmation.value?.slot) {
        for (let attempt = 0; attempt < this.confirmAttempts / 2 && !timestamp; attempt++) {
          try {
            timestamp = await this.connection.getBlockTime(confirmation.value.slot);
          } catch (error) {
            console.error("[signAndSendTransaction] Error getting block time:", error);
            await new Promise((resolve) => setTimeout(resolve, this.confirmAttemptDelay)); // Wait 1 second before next attempt
          }
        }
      }
      return { responseType: "success", txid, timestamp };
    } catch (error) {
      console.error("[signAndSendTransaction] Error confirming transaction:", error);
      const response: SubmitSignedTransactionResponse = { responseType: "fail", error: JSON.stringify(error) };
      return response;
    }
  }

  async confirmTransaction(
    txid: string,
    lastValidBlockHeight: number,
  ): Promise<RpcResponseAndContext<SignatureStatus>> {
    const AVG_BLOCK_TIME = 400; // ms
    let blockHeight: number = 0;
    let attempt = 0;

    do {
      blockHeight = await this.connection.getBlockHeight({ commitment: "confirmed" });
      const estimatedTimeTillExpiry = (lastValidBlockHeight - blockHeight) * AVG_BLOCK_TIME;
      const timeToRecheckBlockHeight = Date.now() + estimatedTimeTillExpiry;
      do {
        console.log(`Tx Confirmation Attempt ${attempt + 1}`);
        try {
          const status = await this.connection.getSignatureStatus(txid, {
            searchTransactionHistory: true,
          });

          const acceptedStates: TransactionConfirmationStatus[] = ["confirmed", "finalized"]; // processed is not accepted, 5% orphan chance

          if (status.value?.confirmationStatus && acceptedStates.includes(status.value.confirmationStatus)) {
            return status as RpcResponseAndContext<SignatureStatus>;
          }

          if (status.value?.err) {
            console.error("[confirmTransaction] Error getting transaction confirmation:", status.value.err);
          }
        } catch (error) {
          console.log(`Attempt ${attempt + 1} failed:`, error);
        }
        await new Promise((resolve) => setTimeout(resolve, this.confirmAttemptDelay)); // Wait 1 second before next attempt
        attempt++;
      } while (Date.now() < timeToRecheckBlockHeight);
    } while (blockHeight <= lastValidBlockHeight);

    throw new Error("Transaction expired");
  }

  async simulateTransactionWithResim(
    transaction: VersionedTransaction,
    contextSlot: number,
    sigVerify: boolean,
    replaceRecentBlockhash: boolean,
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    // Try simulation multiple times
    for (let attempt = 0; attempt < this.maxSimAttempts; attempt++) {
      try {
        const response = await this.connection.simulateTransaction(transaction, {
          replaceRecentBlockhash: replaceRecentBlockhash,
          sigVerify: sigVerify,
          commitment: "processed",
          minContextSlot: contextSlot,
        });
        if (response.value.err) {
          throw new Error(JSON.stringify(response.value.err));
        }
        return response;
      } catch (error) {
        console.log(`Simulation attempt ${attempt + 1}/${this.maxSimAttempts} failed:`, error);
        if (attempt === this.maxSimAttempts - 1) {
          throw new Error(JSON.stringify(error));
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        continue;
      }
    }
    // this should never happen
    throw new Error("Simulation failed after all attempts. No error was provided");
  }

  private async getSimulationComputeUnits(
    instructions: TransactionInstruction[],
    addressLookupTableAccounts: AddressLookupTableAccount[],
    contextSlot: number,
  ): Promise<number> {
    const simulatedInstructions = [
      // Set max limit in simulation so tx succeeds and the necessary compute unit limit can be calculated
      ComputeBudgetProgram.setComputeUnitLimit({ units: MAX_CHAIN_COMPUTE_UNITS }),
      ...instructions,
    ];

    const testTransaction = new VersionedTransaction(
      new TransactionMessage({
        instructions: simulatedInstructions,
        payerKey: this.feePayerKeypair.publicKey,
        recentBlockhash: PublicKey.default.toString(), // doesn't matter due to replaceRecentBlockhash
      }).compileToV0Message(addressLookupTableAccounts),
    );

    console.log("Compute Unit Simulation");

    const rpcResponse = await this.simulateTransactionWithResim(testTransaction, contextSlot, false, true);

    if (!rpcResponse.value.unitsConsumed) {
      throw new Error("Transaction sim returned undefined unitsConsumed");
    }

    return rpcResponse.value.unitsConsumed;
  }

  // ----------- Instruction Modification ------------

  private filterComputeInstructions(instructions: TransactionInstruction[]) {
    const computeUnitLimitIndex = instructions.findIndex(
      (ix) => ix.programId.equals(ComputeBudgetProgram.programId) && ix.data[0] === 0x02,
    );
    const computeUnitPriceIndex = instructions.findIndex(
      (ix) => ix.programId.equals(ComputeBudgetProgram.programId) && ix.data[0] === 0x03,
    );

    const initComputeUnitPrice =
      computeUnitPriceIndex >= 0
        ? Number(ComputeBudgetInstruction.decodeSetComputeUnitPrice(instructions[computeUnitPriceIndex]!).microLamports)
        : this.maxComputePrice; // the "!" is redundant, as we just found it above and `>= 0` check ensures it's exists. Just satisfies the linter.

    // Remove the initial compute unit limit and price instructions, handling the case where removing the first affects the index of the second
    const filteredInstructions = instructions.filter(
      (_, index) => index !== computeUnitLimitIndex && index !== computeUnitPriceIndex,
    );

    return {
      initComputeUnitPrice,
      filteredInstructions,
    };
  }

  /**
   * Optimizes compute budget instructions by estimating the compute units and setting a reasonable compute unit price
   * @param instructions - The instructions to optimize
   * @param addressLookupTableAccounts - The address lookup table accounts
   * @param cfg - Config
   * @returns The optimized instructions
   */
  async optimizeComputeInstructions(
    instructions: TransactionInstruction[],
    addressLookupTableAccounts: AddressLookupTableAccount[],
    contextSlot: number,
  ): Promise<TransactionInstruction[]> {
    const { initComputeUnitPrice, filteredInstructions } = this.filterComputeInstructions(instructions);

    const simulatedComputeUnits = await this.getSimulationComputeUnits(
      filteredInstructions,
      addressLookupTableAccounts,
      contextSlot,
    );

    const estimatedComputeUnitLimit = Math.ceil(simulatedComputeUnits * 1.1);

    // use the least expensive compute unit price, note microLamports is the price per compute unit
    const computePrice =
      initComputeUnitPrice * this.autoPriorityFeeMultiplier < this.maxComputePrice
        ? initComputeUnitPrice * this.autoPriorityFeeMultiplier
        : this.maxComputePrice;

    // Add the new compute unit limit and price instructions to the beginning of the instructions array
    filteredInstructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: computePrice }));
    filteredInstructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units: estimatedComputeUnitLimit }));

    return filteredInstructions;
  }

  /**
   * Reassigns rent payer in instructions to the fee payer
   */
  reassignRentInstructions(instructions: TransactionInstruction[]): TransactionInstruction[] {
    return instructions.map((instruction) => {
      // If this is an ATA creation instruction, modify it to make fee payer pay for rent
      if (instruction.programId.equals(ATA_PROGRAM_PUBLIC_KEY)) {
        return new TransactionInstruction({
          programId: instruction.programId,
          keys: [
            {
              pubkey: this.feePayerKeypair.publicKey,
              isSigner: true,
              isWritable: true,
            },
            ...instruction.keys.slice(1),
          ],
          data: instruction.data,
        });
      }

      // This is a CloseAccount instruction, receive the residual funds as the FeePayer
      if (
        instruction.programId.equals(TOKEN_PROGRAM_PUBLIC_KEY) &&
        instruction.data.length === 1 &&
        instruction.data[0] === 9
      ) {
        const firstKey = instruction.keys[0];
        if (!firstKey) {
          throw new Error("Invalid instruction: missing account key at index 0");
        }

        return new TransactionInstruction({
          programId: instruction.programId,
          keys: [
            firstKey,
            {
              pubkey: this.feePayerKeypair.publicKey,
              isSigner: false,
              isWritable: true,
            },
            ...instruction.keys.slice(2),
          ],
          data: instruction.data,
        });
      }

      return instruction;
    });
  }

  /**
   * Creates a token close instruction if needed
   */
  async createTokenCloseInstruction(
    userPublicKey: PublicKey,
    tokenAccount: PublicKey,
    sellTokenId: PublicKey,
    sellQuantity: number,
  ): Promise<TransactionInstruction | null> {

    // Check if the sell quantity is equal to the token account balance
    const balance = await this.getTokenBalance(userPublicKey, sellTokenId);
    if (sellQuantity === balance) {
      const closeInstruction = createCloseAccountInstruction(
        tokenAccount,
        this.feePayerKeypair.publicKey,
        userPublicKey,
      );
      return closeInstruction;
    }
    return null;
  }

  async getTokenBalance(userPublicKey: PublicKey, tokenMint: PublicKey): Promise<number> {
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      userPublicKey,
      { mint: new PublicKey(tokenMint) },
      "processed",
    );

    if (tokenAccounts.value.length === 0 || !tokenAccounts.value[0]?.account.data.parsed.info.tokenAmount.amount)
      return 0;

    const balance = Number(tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount);
    return balance;
  }
}
