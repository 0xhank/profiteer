import supabase from "@/sbClient";
import { CreateBondingCurveInput, CurveCompleteEvent, SwapInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import {
    fromWeb3JsKeypair,
    fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
    getAssociatedTokenAddressSync,
    TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair as Web3JsKeypair } from "@solana/web3.js";
import { getTxEventsFromTxBuilderResponse, processTransaction } from "programs";

export const createPumpService = () => {
    const { umi, sdk, connection, program } = initProviders();

    const slotSubscribers = new Map<string, (slot: number) => void>();
    let pollInterval: NodeJS.Timeout | null = null;

    let slot = 0;
    let lastChecked = 0
    const getSlot = async () => {
        if (lastChecked + 1000 < Date.now()) {
            slot = await connection.getSlot();
            lastChecked = Date.now();
        }

        return slot;
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

    const createBondingCurve = async (input: CreateBondingCurveInput) => {
        const mintKp = fromWeb3JsKeypair(Web3JsKeypair.generate());
        const curveSdk = sdk.getCurveSDK(mintKp.publicKey);
        const txBuilder = curveSdk.createBondingCurve(
            { ...input, startSlot: null },
            mintKp,
            false
        );

        try {
            const tx = await processTransaction(umi, txBuilder);
            const events = await getTxEventsFromTxBuilderResponse(
                connection,
                // @ts-ignore TODO: fix this
                program,
                tx
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
                    name: createEvent.name,
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
                    article_name: input.name,
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

    const swap = async (input: SwapInput) => {
        const mintKp = new PublicKey(input.mint);
        const curveSdk = sdk.getCurveSDK(fromWeb3JsPublicKey(mintKp));
        const txBuilder = curveSdk.swap({
            direction: input.direction,
            exactInAmount: BigInt(input.amount),
            minOutAmount: BigInt(input.minAmountOut),
        });
        try {
            const tx = await processTransaction(umi, txBuilder);
            const events = await getTxEventsFromTxBuilderResponse(
                connection,
                // @ts-ignore TODO: fix this
                program,
                tx
            );

            const swapEvent = events.TradeEvent?.[0];
            if (!swapEvent) {
                throw new Error("SwapEvent not found");
            }

            const complete = !!events.CompleteEvent?.[0];
            const { error: curveError } = await supabase
                .from("curve_data")
                .insert({
                    mint: mintKp.toBase58(),
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
                    }).eq("mint", mintKp.toBase58());
            }
            if (curveError) {
                console.error(curveError);
                throw new Error(
                    `Failed to insert curve data: ${curveError.message}`
                );
            }
            
            return tx;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const migrate = async (mint: string) => {
        const mintKp = new PublicKey(mint);
        const curveSdk = sdk.getCurveSDK(fromWeb3JsPublicKey(mintKp));
        const txBuilder = curveSdk.migrate();
        try {
            const tx = await processTransaction(umi, txBuilder);
            return tx;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
  

    return {
        getUserBalance,
        getUserTokenBalance,
        getAllUserTokenBalances,
        subscribeToSlot,
        unsubscribeFromSlot,
        createBondingCurve,
        swap,
        migrate,
        getSlot,
    };
};

export type PumpService = ReturnType<typeof createPumpService>;
