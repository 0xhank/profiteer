import { initTRPC } from "@trpc/server";
import { NewsService } from "./services/NewsService";

export type AppContext = {
  newsService: NewsService;
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
    getStatus: t.procedure.query(({ ctx }) => {
      return ctx.newsService.getStatus();
    }),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
