import supabase from "@/sbClient";
import { CreateBondingCurveInput, SwapInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import {
    fromWeb3JsKeypair,
    fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair, PublicKey, Keypair as Web3JsKeypair } from "@solana/web3.js";
import { getTxEventsFromTxBuilderResponse, processTransaction } from "programs";

export const createPumpService = () => {
    const { umi, sdk, connection, program } = initProviders();

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
                });
            if (metadataError) {
                throw new Error(
                    `Failed to insert token metadata: ${metadataError.message}`
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
            exactInAmount: input.amount,
            minOutAmount: input.minAmountOut,
        });
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
        const { error: curveError } = await supabase.from("curve_data").insert({
            mint: mintKp.toBase58(),
            real_sol_reserves: Number(swapEvent.realSolReserves),
            real_token_reserves: Number(swapEvent.realTokenReserves),
            virtual_sol_reserves: Number(swapEvent.virtualSolReserves),
            virtual_token_reserves: Number(swapEvent.virtualTokenReserves),
        });
        if (curveError) {
            throw new Error(
                `Failed to insert curve data: ${curveError.message}`
            );
        }
        const completeEvent = events.CompleteEvent?.[0];
        if (completeEvent) {
            await handleCurveComplete(mintKp);
        }

        return tx;
    };

    const handleCurveComplete = async (mint: PublicKey) => {};

    return {
        getUserBalance,
        getUserTokenBalance,

        createBondingCurve,
        swap,
    };
};

export type PumpService = ReturnType<typeof createPumpService>;
