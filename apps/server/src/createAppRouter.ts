import { initTRPC } from "@trpc/server";
import { Token } from "shared/src/types/token";
import supabase from "./sbClient";
import { z } from "zod";

export type AppContext = {
  jwtToken: string;
};

// Initialize Supabase client

/**
 * Creates and configures the main tRPC router with all API endpoints.
 * @returns A configured tRPC router with all procedures
 */
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
      return [
        {
          id: 1,
          created_at: "2024-01-01",
          solana_address: "0x123",
          twitter_username: "test",
          token_address: "0x123",
          token_name: "test",
          token_symbol: "test",
          token_image: "test",
          price_usd: 100,
          mint: "test",
        },
      ];
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
        return null;
      }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
