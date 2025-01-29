#!/usr/bin/env node
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { config } from "dotenv";
import fastify from "fastify";
import { parseEnv } from "./parseEnv";
import { NewsService } from "../services/NewsService";
import { createAppRouter } from "../createAppRouter";
import { AppRouter } from "../createAppRouter";

config({ path: "../../.env" });

export const env = parseEnv();

// @see https://fastify.dev/docs/latest/
export const server = fastify({
  maxParamLength: 5000,
  logger: true,
});

// k8s healthchecks
server.get("/healthz", (_, res) => res.code(200).send());
server.get("/readyz", (_, res) => res.code(200).send());
server.get("/", (_, res) => res.code(200).send("hello world"));

// Helper function to extract bearer token
// @ts-expect-error IncomingMessage is not typed
const getBearerToken = (req: IncomingMessage) => {
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
};

export const start = async () => {
  try {
    await server.register(import("@fastify/compress"));
    await server.register(import("@fastify/cors"));

    const newsService = new NewsService();

    // @see https://trpc.io/docs/server/adapters/fastify
    server.register(fastifyTRPCPlugin<AppRouter>, {
      prefix: "/trpc",
      trpcOptions: {
        router: createAppRouter(),
        createContext: async (opt) => ({
          newsService,
          jwtToken: getBearerToken(opt.req) ?? "",
        }),
      },
    });
    await server.listen({ host: env.SERVER_HOST, port: env.SERVER_PORT });
    console.log(
      `tub server listening on http://${env.SERVER_HOST}:${env.SERVER_PORT}`
    );

    return server;
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
