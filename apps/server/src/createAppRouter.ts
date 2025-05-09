import { initTRPC } from "@trpc/server";
import { Token } from "shared/src/types/token";
import { z } from "zod";
import { PumpService } from "./services/PumpService";
import { WikiService } from "./services/WikiService";
import { createBondingCurveInputSchema, swapInputSchema } from "./types";
import { Env } from "@bin/envSchema";
import { PublicKey } from "@solana/web3.js";
import { AuthService } from "./services/AuthService";
import { JupiterService } from "./services/JupiterService";

export type AppContext = {
    jupiterService: JupiterService;
    pumpService: PumpService;
    jwtToken: string;
    authService: AuthService;
    wikiService: WikiService;
    env: Env;
};

type UserContext = {
    userId: string;
    walletPublicKey: PublicKey;
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
            const rpc = ctx.env.RPC_URL;
            if (rpc.includes("localhost")) {
                return "local";
            } else if (rpc.includes("devnet")) {
                return "devnet";
            } else {
                return "mainnet";
            }
        }),
        isAuthorized: t.procedure
            .input(z.object({ id: z.string() }))
            .query(async ({ ctx, input }) => {
                return await ctx.authService.isAuthorized(input.id);
            }),

        requestAuth: t.procedure
            .input(z.object({ id: z.string(), code: z.string() }))
            .mutation(async ({ ctx, input }) => {
                await ctx.authService.requestAuth(input.id, input.code);
            }),

        getAirdrop: t.procedure
            .input(z.object({ address: z.string() }))
            .mutation(async ({ ctx, input }) => {
                if (!ctx.env.RPC_URL.includes("localhost")) {
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

        createBondingCurveTx: t.procedure
            .input(createBondingCurveInputSchema)
            .mutation(async ({ input, ctx }) => {
                return await ctx.pumpService.createBondingCurveTx(input);
            }),

        sendCreateBondingCurveTx: t.procedure
            .input(z.object({ txId: z.string(), txMessage: z.string() }))
            .mutation(async ({ input, ctx }) => {
                return await ctx.pumpService.sendCreateBondingCurveTx({
                    txId: input.txId,
                    txMessage: input.txMessage,
                });
            }),

        createSwapTx: t.procedure
            .input(swapInputSchema)
            .query(async ({ input, ctx }) => {
                return ctx.pumpService.createSwapTx(input);
            }),

        sendSwapTx: t.procedure
            .input(z.object({ txId: z.string(), txMessage: z.string() }))
            .mutation(async ({ input, ctx }) => {
                return ctx.pumpService.sendSwapTx(input);
            }),


        createJupiterSwap: t.procedure
            .input(swapInputSchema)
            .query(async ({ input, ctx }) => {
                return ctx.jupiterService.fetchSwap(input);
            }),

        sendJupiterSwap: t.procedure
            .input(z.object({ id: z.string(), signedTx: z.string() }))
            .mutation(async ({ input, ctx }) => {
                return ctx.jupiterService.sendSwapTx(input);
            }),

        migrate: t.procedure
            .input(
                z.object({
                    mint: z.string(),
                    computeUnitPriceMicroLamports: z.number(),
                })
            )
            .mutation(async ({ input, ctx }) => {
                return ctx.pumpService.migrate(input.mint, input.computeUnitPriceMicroLamports);
            }),
    });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
