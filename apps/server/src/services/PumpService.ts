import supabase from "@/sbClient";
import { CreateBondingCurveInput, SwapInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import { Keypair, Signer, TransactionBuilder } from "@metaplex-foundation/umi";
import {
    fromWeb3JsKeypair,
    fromWeb3JsPublicKey,
    toWeb3JsKeypair,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
    MessageV0,
    PublicKey,
    VersionedTransaction,
    Keypair as Web3JsKeypair,
} from "@solana/web3.js";
import { getTxEventsFromTxBuilderResponse, processTransaction } from "programs";

export const createPumpService = () => {
    const { umi, sdk, connection, program, masterWallet } = initProviders();

    const slotSubscribers = new Map<string, (slot: number) => void>();
    let pollInterval: NodeJS.Timeout | null = null;

    let slot = 0;
    let lastChecked = 0;
    const getSlot = async () => {
        if (lastChecked + 1000 < Date.now()) {
            slot = await connection.getSlot();
            lastChecked = Date.now();
        }

        return slot;
    };

    const sendAirdrop = async (address: string) => {
        try {
            const tx = await connection.requestAirdrop(
                new PublicKey(address),
                2000000000
            );

            await connection.confirmTransaction(tx, "confirmed");
            return tx;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };
    const startPolling = () => {
        if (pollInterval) return; // Already polling

        // First emit immediately to avoid delay
        connection.getSlot().then((slot) => {
            slotSubscribers.forEach((callback) => callback(slot));
        });

        pollInterval = setInterval(async () => {
            const slot = await connection.getSlot();
            // Remove the console.log to reduce noise
            slotSubscribers.forEach((callback) => {
                callback(slot);
            });
        }, 1000); // Consider increasing this interval if you don't need updates every second
    };

    const stopPolling = () => {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    };

    // Start/stop polling based on subscribers
    const subscribeToSlot = (key: string, callback: (slot: number) => void) => {
        console.log(
            `[PumpService] New subscription: ${key}. Active subscribers: ${slotSubscribers.size}`
        );
        console.log(
            "[PumpService] Current subscribers:",
            Array.from(slotSubscribers.keys())
        );

        slotSubscribers.set(key, callback);
        if (slotSubscribers.size === 1) {
            console.log("[PumpService] Starting polling...");
            startPolling();
        }
        return () => {
            console.log(`[PumpService] Unsubscribing: ${key}`);
            unsubscribeFromSlot(key);
        };
    };

    const unsubscribeFromSlot = (key: string) => {
        slotSubscribers.delete(key);
        console.log(
            `[PumpService] Unsubscribed: ${key}. Remaining subscribers: ${slotSubscribers.size}`
        );
        if (slotSubscribers.size === 0) {
            console.log("[PumpService] Stopping polling - no subscribers");
            stopPolling();
        }
    };

    const getUserBalance = async (address: string) => {
        const balance = await connection.getBalance(new PublicKey(address));
        return balance;
    };

    const getUserTokenBalance = async (address: string, mint: string) => {
        const tokenAccount = await getAssociatedTokenAddressSync(
            new PublicKey(mint),
            new PublicKey(address),
            false
        );

        const tokenAccountBalance = await connection.getTokenAccountBalance(
            tokenAccount,
            "confirmed"
        );
        return tokenAccountBalance;
    };

    const getAllUserTokenBalances = async (
        address: string
    ): Promise<{ mint: string; balanceToken: number }[]> => {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(address),
            { programId: TOKEN_PROGRAM_ID },
            "processed"
        );

        const tokenBalances = tokenAccounts.value.map((account) => ({
            mint: account.account.data.parsed.info.mint as string,
            balanceToken: Math.round(
                Number(account.account.data.parsed.info.tokenAmount.amount)
            ),
        }));
        return tokenBalances;
    };

    // Clean up stale entries every 30s
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of mintKpRegistry.entries()) {
            if (now - value.createdAt > 60000) {
                // 60s
                mintKpRegistry.delete(key);
            }
        }
    }, 30000);


    const createBondingCurveTx = async (input: CreateBondingCurveInput) => {
        const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
        const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
        const name = input.name.replace(/_/g, " ");
        const userPublicKey = fromWeb3JsPublicKey(
            new PublicKey(input.userPublicKey)
        );

        console.log("userPublicKey ===>>>", input.userPublicKey);

        let tx = await curveSdk.createBondingCurve(
            { ...input, name: name.slice(0, 32), startSlot: null },
            mintKp,
            userPublicKey,
            false
        );
        // log the signers of the tx
        console.log("signers ===>>>", tx.message.header.numRequiredSignatures);
        const txMessageBase64 = Buffer.from(tx.message.serialize()).toString("base64");
        const returnObject = {
            txMessage: txMessageBase64,
        };
        mintKpRegistry.set(txMessageBase64, {
            kp: mintKp,
            createdAt: Date.now(),
            name: input.name,
            description: input.description,
        });
        return returnObject;
    };

    const mintKpRegistry = new Map<
        string,
        { kp: Keypair; createdAt: number; name: string; description: string }
    >();

    const sendCreateBondingCurveTx = async ({
        userPublicKey,
        txMessage: txInput,
        signature,
    }: {
        userPublicKey: string;
        txMessage: string;
        signature: string;
    }) => {
        try {
            const entry = mintKpRegistry.get(txInput);
            if (!entry) {
                throw new Error("Mint Kp not found");
            }
            const txMessage = Buffer.from(txInput, "base64");
            const { kp, name, description } = entry;
            const pubKey = new PublicKey(userPublicKey);
            console.log("pubKey ===>>>", pubKey);
            // Convert base64 signature to Uint8Array first
            const signatureUint8 = Uint8Array.from(
                Buffer.from(signature, "base64")
            );
            const message = MessageV0.deserialize(txMessage);

            const transaction = new VersionedTransaction(message);

            console.log("signatures ===>>>", transaction.signatures.length, transaction.signatures);
            console.log("numRequiredSignatures ===>>>", transaction.message.header.numRequiredSignatures);
            transaction.sign([toWeb3JsKeypair(kp)]);
            transaction.addSignature(pubKey, signatureUint8);

            const txId = await connection.sendTransaction(transaction);

            const events = await getTxEventsFromTxBuilderResponse(
                connection,
                // @ts-ignore TODO: fix this
                program,
                txId
            );

            const createEvent = events.CreateEvent?.[0];
            if (!createEvent) {
                throw new Error("CreateEvent not found");
            }

            const { error: metadataError } = await supabase
                .from("token_metadata")
                .insert({
                    mint: createEvent.mint.toBase58(),
                    creator: createEvent.creator.toBase58(),
                    name: name,
                    description: description,
                    symbol: createEvent.symbol,
                    uri: createEvent.uri,
                    start_slot: createEvent.startSlot.toNumber(),
                    supply: 1_000_000_000_000_000,
                    decimals: 6,
                });
            if (metadataError) {
                throw new Error(
                    `Failed to insert token metadata: ${metadataError.message}`
                );
            }
            const { error: nameError } = await supabase
                .from("mint_article_name")
                .insert({
                    mint: createEvent.mint.toBase58(),
                    article_name: name,
                });
            if (nameError) {
                throw new Error(
                    `Failed to insert token name: ${nameError.message}`
                );
            }
            const { error: curveError } = await supabase
                .from("curve_data")
                .insert({
                    mint: createEvent.mint.toBase58(),
                    real_sol_reserves: Number(createEvent.virtualSolReserves),
                    real_token_reserves: Number(
                        createEvent.virtualTokenReserves
                    ),
                    virtual_sol_reserves: Number(
                        createEvent.virtualSolReserves
                    ),
                    virtual_token_reserves: Number(
                        createEvent.virtualTokenReserves
                    ),
                });

            if (curveError) {
                throw new Error(
                    `Failed to insert curve data: ${curveError.message}`
                );
            }
            return createEvent.mint.toBase58();
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const swapRegistry = new Map<
        string,
        {
            mint: string;
            direction: string;
            amount: bigint;
            minAmountOut: bigint;
            createdAt: number;
        }
    >();

    // New function to prepare swap tx
    const createSwapTx = async (input: SwapInput) => {
        const mintKp = new PublicKey(input.mint);
        const curveSdk = sdk.getCurveSDK(fromWeb3JsPublicKey(mintKp));
        const userPublicKey = new PublicKey(input.userPublicKey);

        const fakeSigner = {
            publicKey: fromWeb3JsPublicKey(userPublicKey),
        } as Signer;

        let txBuilder = curveSdk.swap({
            direction: input.direction,
            user: fromWeb3JsPublicKey(userPublicKey),
            exactInAmount: BigInt(input.amount),
            minOutAmount: BigInt(input.minAmountOut),
        });

        const blockhash = await connection.getLatestBlockhash();
        txBuilder = txBuilder.setBlockhash(blockhash.blockhash);

        const { serializedMessage } = txBuilder.build({
            ...umi,
            payer: fakeSigner,
        });

        const txMessageBase64 =
            Buffer.from(serializedMessage).toString("base64");

        swapRegistry.set(txMessageBase64, {
            mint: input.mint,
            direction: input.direction,
            amount: BigInt(input.amount),
            minAmountOut: BigInt(input.minAmountOut),
            createdAt: Date.now(),
        });

        return { txMessage: txMessageBase64 };
    };

    // Modified swap function to handle signed tx
    const sendSwapTx = async ({
        userPublicKey,
        txMessage: txInput,
        signature,
    }: {
        userPublicKey: string;
        txMessage: string;
        signature: string;
    }) => {
        try {
            const entry = swapRegistry.get(txInput);
            if (!entry) {
                throw new Error("Swap tx not found");
            }

            const txMessage = Buffer.from(txInput, "base64");
            const pubKey = new PublicKey(userPublicKey);
            const signatureUint8 = Uint8Array.from(
                Buffer.from(signature, "base64")
            );

            const message = MessageV0.deserialize(txMessage);
            console.log(
                "Number of instructions in tx:",
                message.compiledInstructions.length
            );
            const transaction = new VersionedTransaction(message);
            transaction.addSignature(pubKey, signatureUint8);

            const txId = await connection.sendTransaction(transaction);
            const events = await getTxEventsFromTxBuilderResponse(
                connection,
                // @ts-ignore TODO: fix this
                program,
                txId
            );

            const swapEvent = events.TradeEvent?.[0];
            if (!swapEvent) {
                throw new Error("SwapEvent not found");
            }
            console.log("swapEvent ===>>>", swapEvent);

            const complete = !!events.CompleteEvent?.[0];
            const { error: curveError } = await supabase
                .from("curve_data")
                .insert({
                    mint: entry.mint,
                    real_sol_reserves: Number(swapEvent.realSolReserves),
                    real_token_reserves: Number(swapEvent.realTokenReserves),
                    virtual_sol_reserves: Number(swapEvent.virtualSolReserves),
                    virtual_token_reserves: Number(
                        swapEvent.virtualTokenReserves
                    ),
                    user: swapEvent.user.toBase58(),
                    complete,
                });

            if (complete) {
                const { error: priceError } = await supabase
                    .from("token_metadata")
                    .update({
                        complete: true,
                    })
                    .eq("mint", entry.mint);
            }

            if (curveError) {
                throw new Error(
                    `Failed to insert curve data: ${curveError.message}`
                );
            }

            return txId;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    // Add cleanup interval for swapRegistry
    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of swapRegistry.entries()) {
            if (now - value.createdAt > 60000) {
                // 60s
                swapRegistry.delete(key);
            }
        }
    }, 30000);

    const migrate = async (mint: string) => {
        const mintKp = new PublicKey(mint);
        const curveSdk = sdk.getCurveSDK(fromWeb3JsPublicKey(mintKp));
        const txBuilder = await curveSdk.migrate();
        try {
            const preTx = await processTransaction(umi, txBuilder.preTxBuilder);
            const tx = await processTransaction(umi, txBuilder.txBuilder);
            return preTx;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    return {
        sendAirdrop,

        getUserBalance,
        getUserTokenBalance,
        getAllUserTokenBalances,
        subscribeToSlot,
        unsubscribeFromSlot,

        createBondingCurveTx,
        sendCreateBondingCurveTx,

        createSwapTx,
        sendSwapTx,

        migrate,
        getSlot,
    };
};

export type PumpService = ReturnType<typeof createPumpService>;
