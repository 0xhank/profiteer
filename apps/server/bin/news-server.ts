#!/usr/bin/env node
import { createPumpService } from "@/services/PumpService";
import { WikiService } from "@/services/WikiService";
import fastifyWebsocket from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import fastify from "fastify";
import { IncomingMessage } from "http";
import { AppRouter, createAppRouter } from "../src/createAppRouter";
import env from "./env";

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

export const start = async () => {
    try {
        // Register WebSocket plugin here instead
        await server.register(fastifyWebsocket);
        await server.register(import("@fastify/compress"));
        await server.register(import("@fastify/cors"));

        const pumpService = createPumpService();
        const wikiService = WikiService();
        // @see https://trpc.io/docs/server/adapters/fastify
        server.register(fastifyTRPCPlugin<AppRouter>, {
            prefix: "/trpc",
            useWSS: true,
            trpcOptions: {
                router: createAppRouter(),
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

        // Apply WebSocket handler
        applyWSSHandler({
            wss: server.websocketServer,
            router: createAppRouter(),
            // @ts-expect-error IncomingMessage is not typed
            createContext: async (
                opt: NodeHTTPCreateContextFnOptions<IncomingMessage, WebSocket>
            ) => ({
                pumpService,
                wikiService,
                jwtToken: getBearerToken(opt.req) ?? "",
            }),
        });
        return server;
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
