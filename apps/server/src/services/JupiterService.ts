import { JupiterSwapInput, SwapInput } from "@/types";
import { v4 as uuidv4 } from "uuid";
import {
    createCloseAccountInstruction,
    getAssociatedTokenAddressSync,
    NATIVE_MINT,
} from "@solana/spl-token";
import {
    AddressLookupTableAccount,
    ComputeBudgetInstruction,
    ComputeBudgetProgram,
    Connection,
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";
import env from "@bin/env";
import {
    DefaultApi as JupiterApi,
    createJupiterApiClient,
    QuoteGetRequest,
    QuoteResponse,
    SwapInstructionsPostRequest,
} from "@jup-ag/api";
import { MAX_CHAIN_COMPUTE_UNITS } from "@/constants/tokens";
import { getTxEventsFromTxBuilderResponse } from "programs/clients/js/src/utils";
import supabase from "@/sbClient";

interface JupiterInstruction {
    programId: string;
    accounts: Array<{
        pubkey: string;
        isSigner: boolean;
        isWritable: boolean;
    }>;
    data: string;
}

export class JupiterService {
    private connection: Connection;
    private jupiterQuoteApi: JupiterApi;

    constructor() {
        this.connection = new Connection(env.RPC_URL);
        this.jupiterQuoteApi = createJupiterApiClient({
            basePath: env.JUPITER_URL,
        });
    }
    // Clean up stale entries every 30s
    private jupiterSwapRegistry = new Map<
        string,
        { id: string; transaction: VersionedTransaction; createdAt: number }
    >();
    async fetchSwap(request: SwapInput) {
        const walletPublicKey = new PublicKey(request.userPublicKey);
        const [tokenAccount, solAccount] = this.deriveTokenAccounts(
            walletPublicKey,
            request.mint,
            NATIVE_MINT.toBase58()
        );
        if (!tokenAccount || !solAccount) {
            throw new Error("Token account or SOL account not found");
        }

        return await this.buildSwapResponse({
            ...request,
            tokenAccount,
            solAccount,
            userKey: walletPublicKey,
        });
    }

    /**
     * Derives associated token accounts for buy and sell tokens
     * @param userPublicKey - The user's public key
     * @param buyTokenId - ID of token to buy
     * @param sellTokenId - ID of token to sell
     * @returns Object containing derived token account addresses
     */
    deriveTokenAccounts(
        userPublicKey: PublicKey,
        ...tokens: string[]
    ): PublicKey[] {
        return tokens.map((token) =>
            getAssociatedTokenAddressSync(
                new PublicKey(token),
                userPublicKey,
                false
            )
        );
    }

    async buildSwapResponse(request: JupiterSwapInput) {
        // Calculate fee if swap type is buy
        const amountIn = Number(request.amount);
        const solAmount = request.direction == "buy" ? amountIn : 0;
        const onePercentOfSolAmount = solAmount * 0.01;
        const fee = Math.min(0.0001, onePercentOfSolAmount);
        if (fee > amountIn) {
            throw new Error("Fee is greater than amount");
        }
        const swapAmount = amountIn - fee;

        // Create token account close instruction if swap type is sell_all (conditional occurs within function)
        const tokenBalance = await this.connection.getTokenAccountBalance(
            request.tokenAccount
        );

        // Get swap instructions from Jupiter
        // if slippageBps is provided, use it
        // if slippageBps is not provided, use autoSlippage if its true, otherwise use MAX_DEFAULT_SLIPPAGE_BPS
        const swapInstructionRequest: QuoteGetRequest = {
            inputMint:
                request.direction == "buy"
                    ? request.mint
                    : NATIVE_MINT.toBase58(),
            outputMint:
                request.direction == "buy"
                    ? NATIVE_MINT.toBase58()
                    : request.mint,
            amount: swapAmount,
            slippageBps: request.slippageBps,
            autoSlippage: true,
            maxAutoSlippageBps: 500,
            onlyDirectRoutes: false,
            restrictIntermediateTokens: true,
            maxAccounts: 50,
            asLegacyTransaction: false,
        };

        const {
            instructions: swapInstructions,
            addressLookupTableAccounts,
            quote,
        } = await this.getSwapInstructions(
            swapInstructionRequest,
            request.userKey
        );

        if (!swapInstructions?.length) {
            throw new Error("No swap instruction received");
        }

        const isSellAll =
            request.direction === "sell" &&
            Number(tokenBalance.value.amount) === amountIn;

        const closeInstruction = isSellAll
            ? createCloseAccountInstruction(
                  request.tokenAccount,
                  request.userKey,
                  request.userKey
              )
            : null;

        const instructions = [...swapInstructions];
        if (closeInstruction) instructions.push(closeInstruction);

        const { blockhash } = await this.connection.getLatestBlockhash();

        // estimate compute budget
        const optimizedInstructions = await this.optimizeComputeInstructions(
            instructions,
            addressLookupTableAccounts,
            quote.contextSlot ?? 0,
            request.userKey
        );
        const message = new TransactionMessage({
            payerKey: request.userKey,
            recentBlockhash: blockhash,
            instructions: optimizedInstructions,
        }).compileToV0Message(addressLookupTableAccounts);

        const transaction = new VersionedTransaction(message);

        const id = uuidv4();
        this.jupiterSwapRegistry.set(id, {
            id,
            transaction,
            createdAt: Date.now(),
        });

        const txMessageBase64 = Buffer.from(transaction.serialize()).toString(
            "base64"
        );
        return {
            txId: id,
            txMessage: txMessageBase64,
        };
    }

    // Modified swap function to handle signed tx
    async sendSwapTx({ id, signedTx }: { id: string; signedTx: string }) {
        try {
            const entry = this.jupiterSwapRegistry.get(id);
            if (!entry) {
                throw new Error("Swap tx not found");
            }

            const txSerialized = Buffer.from(signedTx, "base64");
            const tx = VersionedTransaction.deserialize(txSerialized);

            const simulation = await this.connection.simulateTransaction(tx);
            const sig = await this.connection.sendTransaction(tx);
            const { blockhash, lastValidBlockHeight } =
                await this.connection.getLatestBlockhash();

            await this.connection.confirmTransaction(
                { signature: sig, blockhash, lastValidBlockHeight },
                "confirmed"
            );
            this.jupiterSwapRegistry.delete(id);

            return sig;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    /**
     * Creates a token close instruction if needed
     */
    async createTokenCloseInstruction(
        userPublicKey: PublicKey,
        tokenAccount: PublicKey,
        sellTokenId: PublicKey,
        sellQuantity: number
    ): Promise<TransactionInstruction | null> {
        const closeInstruction = createCloseAccountInstruction(
            tokenAccount,
            userPublicKey,
            userPublicKey
        );
        return closeInstruction;
    }
    /**
     * Gets swap instructions for a quoted trade
     * @param quoteAndSwapParams - Parameters for quote and swap
     * @param userPublicKey - User's public key
     * @param autoPriorityFeeMultiplier - Auto priority fee multiplier
     * @returns Swap instructions from Jupiter
     */
    async getSwapInstructions(
        quoteAndSwapParams: QuoteGetRequest,
        userPublicKey: PublicKey
    ): Promise<{
        instructions: TransactionInstruction[];
        addressLookupTableAccounts: AddressLookupTableAccount[];
        quote: QuoteResponse;
    }> {
        try {
            const minSlippage = 50;
            const quote = await this.jupiterQuoteApi.quoteGet(
                quoteAndSwapParams
            );

            if (!quote) {
                throw new Error("No quote received");
            }

            let dynamicSlippage:
                | undefined
                | { minBps: number; maxBps: number } = undefined;
            // override computedAutoSlippage if it is less than MIN_SLIPPAGE_BPS
            if (quote.computedAutoSlippage) {
                if (quote.computedAutoSlippage <= minSlippage) {
                    dynamicSlippage = {
                        minBps: minSlippage,
                        maxBps: minSlippage,
                    };
                }
            }

            const swapInstructionsRequest: SwapInstructionsPostRequest = {
                swapRequest: {
                    quoteResponse: quote,
                    userPublicKey: userPublicKey.toBase58(),
                    asLegacyTransaction: quoteAndSwapParams.asLegacyTransaction,
                    wrapAndUnwrapSol: true,
                    prioritizationFeeLamports: {
                        priorityLevelWithMaxLamports: {
                            maxLamports: 2000000,
                            global: false,
                            priorityLevel: "high",
                        },
                    },
                    dynamicSlippage: dynamicSlippage,
                },
            };

            const swapInstructions =
                await this.jupiterQuoteApi.swapInstructionsPost(
                    swapInstructionsRequest
                );
            if (!swapInstructions) {
                throw new Error("No swap instructions received");
            }

            const addressLookupTableAccounts = await Promise.all(
                (swapInstructions.addressLookupTableAddresses || []).map(
                    async (address) => {
                        const account =
                            await this.connection.getAddressLookupTable(
                                new PublicKey(address)
                            );
                        if (!account?.value) {
                            throw new Error(
                                `Could not fetch address lookup table account ${address}`
                            );
                        }
                        return account.value;
                    }
                )
            );

            // Combine all instructions in the correct order
            const allInstructions: TransactionInstruction[] = [
                ...(swapInstructions.computeBudgetInstructions || []).map(
                    this.deserializeInstruction
                ),
                ...(swapInstructions.setupInstructions || []).map(
                    this.deserializeInstruction
                ),
                swapInstructions.swapInstruction
                    ? this.deserializeInstruction(
                          swapInstructions.swapInstruction
                      )
                    : [],
                ...(swapInstructions.cleanupInstruction
                    ? [
                          this.deserializeInstruction(
                              swapInstructions.cleanupInstruction
                          ),
                      ]
                    : []),
            ].flat();

            return {
                instructions: allInstructions,
                addressLookupTableAccounts,
                quote,
            };
        } catch (error) {
            console.error(
                "[getSwapInstructions] Error getting swap instructions:",
                error
            );
            throw new Error(
                `Failed to get swap instructions: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }
    async optimizeComputeInstructions(
        instructions: TransactionInstruction[],
        addressLookupTableAccounts: AddressLookupTableAccount[],
        contextSlot: number,
        userPublicKey: PublicKey
    ): Promise<TransactionInstruction[]> {
        const { initComputeUnitPrice, filteredInstructions } =
            this.filterComputeInstructions(instructions);

        const simulatedComputeUnits = await this.getSimulationComputeUnits(
            filteredInstructions,
            addressLookupTableAccounts,
            contextSlot,
            userPublicKey
        );

        const estimatedComputeUnitLimit = Math.ceil(
            simulatedComputeUnits * 1.1
        );

        // use the least expensive compute unit price, note microLamports is the price per compute unit
        const MAX_COMPUTE_PRICE = 1000000;
        const AUTO_PRIO_MULT = 2;
        const computePrice =
            initComputeUnitPrice * AUTO_PRIO_MULT < MAX_COMPUTE_PRICE
                ? initComputeUnitPrice * AUTO_PRIO_MULT
                : MAX_COMPUTE_PRICE;

        // Add the new compute unit limit and price instructions to the beginning of the instructions array
        filteredInstructions.unshift(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: computePrice,
            })
        );
        filteredInstructions.unshift(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: estimatedComputeUnitLimit,
            })
        );

        return filteredInstructions;
    }

    private filterComputeInstructions(instructions: TransactionInstruction[]) {
        const computeUnitLimitIndex = instructions.findIndex(
            (ix) =>
                ix.programId.equals(ComputeBudgetProgram.programId) &&
                ix.data[0] === 0x02
        );
        const computeUnitPriceIndex = instructions.findIndex(
            (ix) =>
                ix.programId.equals(ComputeBudgetProgram.programId) &&
                ix.data[0] === 0x03
        );

        const initComputeUnitPrice =
            computeUnitPriceIndex >= 0
                ? Number(
                      ComputeBudgetInstruction.decodeSetComputeUnitPrice(
                          instructions[computeUnitPriceIndex]!
                      ).microLamports
                  )
                : 1000000; // the "!" is redundant, as we just found it above and `>= 0` check ensures it's exists. Just satisfies the linter.

        // Remove the initial compute unit limit and price instructions, handling the case where removing the first affects the index of the second
        const filteredInstructions = instructions.filter(
            (_, index) =>
                index !== computeUnitLimitIndex &&
                index !== computeUnitPriceIndex
        );

        return {
            initComputeUnitPrice,
            filteredInstructions,
        };
    }
    private deserializeInstruction(
        instruction: JupiterInstruction
    ): TransactionInstruction {
        return new TransactionInstruction({
            programId: new PublicKey(instruction.programId),
            keys: instruction.accounts.map((account) => ({
                pubkey: new PublicKey(account.pubkey),
                isSigner: account.isSigner,
                isWritable: account.isWritable,
            })),
            data: Buffer.from(instruction.data, "base64"),
        });
    }

    private async getSimulationComputeUnits(
        instructions: TransactionInstruction[],
        addressLookupTableAccounts: AddressLookupTableAccount[],
        contextSlot: number,
        userPublicKey: PublicKey
    ): Promise<number> {
        const simulatedInstructions = [
            // Set max limit in simulation so tx succeeds and the necessary compute unit limit can be calculated
            ComputeBudgetProgram.setComputeUnitLimit({
                units: MAX_CHAIN_COMPUTE_UNITS,
            }),
            ...instructions,
        ];

        const testIx = new VersionedTransaction(
            new TransactionMessage({
                instructions: simulatedInstructions,
                payerKey: userPublicKey,
                recentBlockhash: PublicKey.default.toString(), // doesn't matter due to replaceRecentBlockhash
            }).compileToV0Message(addressLookupTableAccounts)
        );

        console.log("Compute Unit Simulation");

        const rpcResponse = await this.connection.simulateTransaction(testIx, {
            replaceRecentBlockhash: false,
            sigVerify: true,
            commitment: "processed",
            minContextSlot: contextSlot,
        });
        if (!rpcResponse.value.unitsConsumed) {
            throw new Error("Transaction sim returned undefined unitsConsumed");
        }

        return rpcResponse.value.unitsConsumed;
    }
}
