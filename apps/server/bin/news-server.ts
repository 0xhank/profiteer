#!/usr/bin/env node
import { createPumpService } from "@/services/PumpService";
import { WikiService } from "@/services/WikiService";
import fastifyWebsocket from "@fastify/websocket";
import { CreateFastifyContextOptions, fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { IncomingMessage } from "http";
import { AppRouter, createAppRouter } from "../src/createAppRouter";
import env from "./env";
import fastify from "fastify";

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
const getBearerToken = (req: IncomingMessage) => {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return null;
};

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const user = { name: req.headers.username ?? 'anonymous' };
  return { req, res, user };
}

export const start = async () => {
  console.log("starting")

    try {
        await server.register(fastifyWebsocket);
        await server.register(import("@fastify/compress"));
        await server.register(import("@fastify/cors"));

        const pumpService = createPumpService();
        const wikiService = WikiService();
        const router = createAppRouter();

        // Single TRPC registration that handles both HTTP and WebSocket
        await server.register(fastifyTRPCPlugin<AppRouter>, {
            prefix: "/trpc",
            trpcOptions: {
                router: router,
                createContext: async (opt) => ({
                    jwtToken: getBearerToken(opt.req.raw) ?? "",
                    pumpService,
                    wikiService,
                }),
            },
        });

        await server.listen({ host: env.SERVER_HOST, port: env.SERVER_PORT });
        console.log(
            `news server listening on http://${env.SERVER_HOST}:${env.SERVER_PORT}`
        );

        return server;
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
