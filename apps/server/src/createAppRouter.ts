import { initTRPC } from "@trpc/server";
import { Token } from "shared/src/types/token";
import { z } from "zod";
import supabase from "./sbClient";

export type AppContext = {
  jwtToken: string;
};

// Initialize Supabase client

/**
 * Creates and configures the main tRPC router with all API endpoints.
 * @returns A configured tRPC router with all procedures
 */
const dummyToken: Token = {
  id: 1,
  createdAt: "2024-01-01",
  tokenName: "Fartcoin",
  tokenSymbol: "FART",
  tokenImage: "https://i.imgur.com/1234567890.png",
  priceUsd: 100,
  mint: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump",
};

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
      return [dummyToken];
    }),

    getTime: t.procedure.query(() => {
      return { time: new Date().toISOString() };
    }),

    getMostRecentTimestamp: t.procedure.query(async () => {
      const { data, error } = await supabase
        .from("test_timestamp")
        .select("recent_time")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Failed to fetch timestamp: ${error.message}`);
      }

      if (data.length === 0) {
        return { recent_time: null };
      }

      return { recent_time: data[0]!.recent_time };
    }),

    getTokenByMint: t.procedure
      .input(z.object({ tokenMint: z.string() }))
      .query(async ({ input }): Promise<Token | null> => {
        return dummyToken;
      }),

    /**
     * Initialization endpoint
     * @returns Object containing a success message
     */
    initialize: t.procedure.mutation(() => {
      return { message: "Initialization successful" };
    }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
