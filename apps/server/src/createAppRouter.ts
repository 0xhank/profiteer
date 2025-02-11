import { initTRPC } from "@trpc/server";
import { Token } from "shared/src/types/token";
import { z } from "zod";
import { PumpService } from "./services/PumpService";
import { WikiService } from "./services/WikiService";
import { createBondingCurveInputSchema, swapInputSchema } from "./types";
import { Env } from "@bin/envSchema";
import supabase from "./sbClient";
import { PublicKey } from "@solana/web3.js";
import { AuthService } from "./services/AuthService";
export type AppContext = {
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

        requestAuth: t.procedure
            .input(z.object({ code: z.string() }))
            .mutation(async ({ ctx, input }) => {
                await ctx.authService.requestAuth(ctx.jwtToken, input.code);
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
