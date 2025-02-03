import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { Token } from "shared/src/types/token";
import { z } from "zod";
import supabase from "./sbClient";
import { PumpService } from "./services/PumpService";
import { WikiService } from "./services/WikiService";
import { createBondingCurveInputSchema, swapInputSchema } from "./types";
import env from "../bin/env";

export type AppContext = {
    pumpService: PumpService;
    jwtToken: string;
    wikiService: WikiService;
};

// Initialize Supabase client

export function createAppRouter() {
    const t = initTRPC.context<AppContext>().create();
    return t.router({
        /**
         * Health check endpoint that returns server status
         * @returns Object containing status code 200 if server is healthy
         */
        getStatus: t.procedure.query(() => {
            return { status: 200 };
        }),

        getChainType: t.procedure.query(async ({ ctx }) => {
            const rpc = env.RPC_URL
            if (rpc.includes("localhost")) {
                return "local";
            } else if (rpc.includes("devnet")) {
                return "devnet";
            } else {
                return "mainnet";
            }
        }),

        getSlot: t.procedure.query(async ({ ctx }) => {
            return ctx.pumpService.getSlot();
        }),

        getAirdrop: t.procedure
            .input(z.object({ address: z.string() }))
            .mutation(async ({ ctx, input }) => {
                if (!env.RPC_URL.includes("localhost")) {
                    throw new Error("Airdrop is not available on this chain");
                }
                return ctx.pumpService.sendAirdrop(input.address);
            }),

        getArticleSymbolOptions: t.procedure
            .input(
                z.object({
                    articleName: z.string(),
                    hardRefresh: z.boolean().optional(),
                })
            )
            .query(async ({ ctx, input }) => {
                return ctx.wikiService.getArticleSymbolOptions(
                    input.articleName,
                    input.hardRefresh
                );
            }),

        getSolBalance: t.procedure
            .input(z.object({ address: z.string() }))
            .query(async ({ ctx, input }) => {
                return ctx.pumpService.getUserBalance(input.address);
            }),

        getTokenBalance: t.procedure
            .input(z.object({ address: z.string(), mint: z.string() }))
            .query(async ({ ctx, input }) => {
                return ctx.pumpService.getUserTokenBalance(
                    input.address,
                    input.mint
                );
            }),

        getAllTokenBalances: t.procedure
            .input(z.object({ address: z.string() }))
            .query(async ({ ctx, input }) => {
                return ctx.pumpService.getAllUserTokenBalances(input.address);
            }),

        /**
         * Fetches all users from the database
         * @returns Array of user objects
         */
        getTokens: t.procedure.query(async (): Promise<Token[]> => {
            const { data, error } = await supabase
                .from("token_metadata")
                .select("*");

            if (error) {
                throw new Error(`Failed to fetch tokens: ${error.message}`);
            }
            if (data.length === 0) {
                return [];
            }
            return data.map((token) => ({
                mint: token.mint,
                createdAt: token.created_at,
                priceUsd: 0,
                metadata: {
                    name: token.name,
                    symbol: token.symbol,
                    imageUri: token.uri,
                    startSlot: token.start_slot,
                    supply: token.supply / 1e5,
                    decimals: 6,
                },
            }));
        }),

        getTokenByMint: t.procedure
            .input(z.object({ tokenMint: z.string() }))
            .query(async ({ input }): Promise<Token | null> => {
                const { data, error } = await supabase
                    .from("token_metadata")
                    .select("*")
                    .eq("mint", input.tokenMint);

                if (error) {
                    return null;
                }
                const rawToken = data[0];
                if (!rawToken) {
                    return null;
                }
                return {
                    ...rawToken,
                    createdAt: rawToken.created_at,
                    priceUsd: 0,
                    metadata: {
                        name: rawToken.name,
                        symbol: rawToken.symbol,
                        imageUri: rawToken.uri,
                        startSlot: rawToken.start_slot,
                        supply: rawToken.supply / 1e5,
                        decimals: 6,
                    },
                    complete: rawToken.complete ?? undefined,
                };
            }),

        createBondingCurve: t.procedure
            .input(createBondingCurveInputSchema)
            .mutation(async ({ input, ctx }) => {
                return ctx.pumpService.createBondingCurve(input);
            }),

        swap: t.procedure
            .input(swapInputSchema)
            .mutation(async ({ input, ctx }) => {
                return ctx.pumpService.swap(input);
            }),

        migrate: t.procedure
            .input(
                z.object({
                    mint: z.string(),
                })
            )
            .mutation(async ({ input, ctx }) => {
                console.log("migrate ===>>>", input.mint);
            return ctx.pumpService.migrate(input.mint);
            }),
    });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
