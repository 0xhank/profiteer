import supabase from "@/sbClient";
import { CreateBondingCurveInput } from "@/types";
import { initProviders } from "@/util/initProviders";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair as Web3JsKeypair } from "@solana/web3.js";
import { getTxEventsFromTxBuilderResponse, processTransaction } from "programs";

export const createPumpService = () => {
    const { umi, sdk, connection, program } = initProviders();

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
            const { error: metadataError } = await supabase.from("token_metadata").insert({
                mint: createEvent.mint.toBase58(),
                creator: createEvent.creator.toBase58(),
                name: createEvent.name,
                symbol: createEvent.symbol,
                uri: createEvent.uri,
                start_slot: createEvent.startSlot.toNumber(),
                supply: 1_000_000_000_000_000
            });
            if (metadataError) {
                throw new Error(
                    `Failed to insert token metadata: ${metadataError.message}`
                );
            }


            const { error: curveError } = await supabase.from("curve_data").insert({
                mint: createEvent.mint.toBase58(),
                real_sol_reserves: Number(createEvent.virtualSolReserves),
                real_token_reserves: Number(createEvent.virtualTokenReserves),
                virtual_sol_reserves: Number(createEvent.virtualSolReserves),
                virtual_token_reserves: Number(createEvent.virtualTokenReserves),
            });

            if (curveError) {
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

    return {
        createBondingCurve,
    };
};

export type PumpService = ReturnType<typeof createPumpService>;
