import { initTRPC } from "@trpc/server";
import { Token } from "./types/token";

export type AppContext = {
  jwtToken: string;
};

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
      console.log("getTokens");
      return [{
        id: 1,
        created_at: "2024-01-01",
        solana_address: "0x123",
        twitter_username: "test",
        token_address: "0x123",
        token_name: "test",
        token_symbol: "test",
        token_image: "test",
        price_usd: 100,
      }];
    }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
