import supabase from "@/sbClient";
import { CreateBondingCurveInput, SwapInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import { Keypair, Signer } from "@metaplex-foundation/umi";
import {
    fromWeb3JsKeypair,
    fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { v4 as uuidv4 } from "uuid";

import {
    PublicKey,
    VersionedTransaction,
    Keypair as Web3JsKeypair,
} from "@solana/web3.js";
import { getTxEventsFromTxBuilderResponse } from "programs";
import { simulateTransaction } from "@coral-xyz/anchor/dist/cjs/utils/rpc";

export const createPumpService = () => {
    const { umi, sdk, connection, program, masterKp } = initProviders();

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
    const createBondingCurveRegistry = new Map<
        string,
        { kp: Keypair; createdAt: number; name: string }
    >();

    setInterval(() => {
        const now = Date.now();
        for (const [key, value] of createBondingCurveRegistry.entries()) {
            if (now - value.createdAt > 60000) {
                // 60s
                createBondingCurveRegistry.delete(key);
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

        let tx = await curveSdk.createBondingCurve(
            { ...input, name: name.slice(0, 32), startSlot: null },
            mintKp,
            userPublicKey,
            false
        );
        // log the signers of the tx
        const txBase64 = Buffer.from(tx.serialize()).toString("base64");
        const txId = uuidv4();

        createBondingCurveRegistry.set(txId, {
            kp: mintKp,
            createdAt: Date.now(),
            name: input.name,
        });
        const returnObject = {
            txId,
            txMessage: txBase64,
        };
        return returnObject;
    };

    const sendCreateBondingCurveTx = async ({
        txId,
        txMessage: txInput,
    }: {
        txId: string;
        txMessage: string;
    }) => {
        try {
            const entry = createBondingCurveRegistry.get(txId);
            if (!entry) {
                throw new Error("Mint Kp not found");
            }
            const txSerialized = Buffer.from(txInput, "base64");
            const tx = VersionedTransaction.deserialize(txSerialized);
            console.log("tx:", tx.message.compiledInstructions.length);
            const { kp, name } = entry;

            const sig = await connection.sendTransaction(tx);
            createBondingCurveRegistry.delete(txId);
            const { blockhash, lastValidBlockHeight } =
                await connection.getLatestBlockhash();
            await connection.confirmTransaction(
                { signature: sig, blockhash, lastValidBlockHeight },
                "confirmed"
            );

            const events = await getTxEventsFromTxBuilderResponse(
                connection,
                // @ts-ignore TODO: fix this
                program,
                sig
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
                    real_sol_reserves: Number(createEvent.realSolReserves),
                    real_token_reserves: Number(createEvent.realTokenReserves),
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
            txId: string;
            txMessage: string;
            mint: string;
            createdAt: number;
        }
    >();
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
    // New function to prepare swap tx
    const createSwapTx = async (input: SwapInput) => {
        const mintKp = new PublicKey(input.mint);
        const curveSdk = sdk.getCurveSDK(fromWeb3JsPublicKey(mintKp));
        const userPublicKey = new PublicKey(input.userPublicKey);

        const tx = await curveSdk.swap({
            direction: input.direction,
            user: fromWeb3JsPublicKey(userPublicKey),
            exactInAmount: BigInt(input.amount),
            minOutAmount: BigInt(input.minAmountOut),
            computeUnitPriceMicroLamports: input.computeUnitPriceMicroLamports,
        });

        const txMessageBase64 = Buffer.from(tx.serialize()).toString("base64");

        const txId = uuidv4();
        swapRegistry.set(txId, {
            mint: input.mint,
            txId,
            txMessage: txMessageBase64,
            createdAt: Date.now(),
        });

        return { txId, txMessage: txMessageBase64 };
    };

    // Modified swap function to handle signed tx
    const sendSwapTx = async ({
        txId,
        txMessage: txInput,
    }: {
        txId: string;
        txMessage: string;
    }) => {
        try {
            const entry = swapRegistry.get(txId);
            if (!entry) {
                throw new Error("Swap tx not found");
            }

            const txSerialized = Buffer.from(txInput, "base64");
            const tx = VersionedTransaction.deserialize(txSerialized);

            const simulation = await connection.simulateTransaction(
                tx,
            );
            const sig = await connection.sendTransaction(tx);
            const { blockhash, lastValidBlockHeight } =
                await connection.getLatestBlockhash();

            await connection.confirmTransaction(
                { signature: sig, blockhash, lastValidBlockHeight },
                "confirmed"
            );
            swapRegistry.delete(txId);

            const events = await getTxEventsFromTxBuilderResponse(
                connection,
                // @ts-ignore TODO: fix this
                program,
                sig
            );

            const swapEvent = events.TradeEvent?.[0];
            if (!swapEvent) {
                throw new Error("SwapEvent not found");
            }

            const complete = !!events.CompleteEvent?.[0];
            const { error: swapError } = await supabase.from("swap").insert({
                mint: entry.mint,
                user_address: swapEvent.user.toBase58(),
                sol_amount: Number(swapEvent.solAmount),
                token_amount: Number(swapEvent.tokenAmount),
                is_buy: swapEvent.isBuy,
            });

            if (swapError) {
                throw new Error(
                    `Failed to insert swap data: ${swapError.message}`
                );
            }

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
            if (curveError) {
                throw new Error(
                    `Failed to insert curve data: ${curveError.message}`
                );
            }

            if (complete) {
                const { error: completeMetadataError } = await supabase
                    .from("token_metadata")
                    .update({
                        complete: true,
                    })
                    .eq("mint", entry.mint);
                const { error: completeCurveError } = await supabase
                    .from("token_migration")
                    .insert({
                        mint: entry.mint,
                        complete: true,
                        migrated: false,
                    });
                if (completeCurveError) {
                    throw new Error(
                        `Failed to insert token migration: ${completeCurveError.message}`
                    );
                }
            }

            return txId;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const migrate = async (mint: string, computeUnitPriceMicroLamports: number) => {
        const mintKp = new PublicKey(mint);
        const curveSdk = sdk.getCurveSDK(fromWeb3JsPublicKey(mintKp));
        const txBuilder = await curveSdk.migrate(masterKp, computeUnitPriceMicroLamports);

        const { blockhash, lastValidBlockHeight } =
            await connection.getLatestBlockhash();
        const res = await connection.simulateTransaction(txBuilder.tx)
        const value = res.value.err
        if (value) {
            throw new Error(value.toString())
        }
        const preMigrateSig = await connection.sendTransaction(
            txBuilder.preTx,
            { preflightCommitment: "confirmed" }
        );
        await connection.confirmTransaction(
            { signature: preMigrateSig, blockhash, lastValidBlockHeight },
            "confirmed"
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const migrateSig = await connection.sendTransaction(txBuilder.tx, {
            preflightCommitment: "confirmed",
        });
        await connection.confirmTransaction(
            { signature: migrateSig, blockhash, lastValidBlockHeight },
            "confirmed"
        );

        supabase.from("token_migration").update({
            mint,
            complete: true,
            migrated: true
        });
       
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
