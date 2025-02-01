import { initTRPC } from "@trpc/server";
import { Token } from "shared/src/types/token";
import { z } from "zod";
import supabase from "./sbClient";
import { PumpService } from "./services/PumpService";
import { createBondingCurveInputSchema } from "./types";

export type AppContext = {
  pumpService: PumpService;
  jwtToken: string;
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
        ...token,
        createdAt: token.created_at,
        imageUri: token.uri,
        priceUsd: 0,
      }));
    }),

    getTime: t.procedure.query(() => {
      return { time: new Date().toISOString() };
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
          imageUri: rawToken.uri,
          priceUsd: 0,
        };
      }),

    createBondingCurve: t.procedure
      .input(createBondingCurveInputSchema)
      .mutation(async ({ input, ctx }) => {
        return ctx.pumpService.createBondingCurve(input);
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
