#!/usr/bin/env node
import { AuthService } from "@/services/AuthService";
import { createPumpService } from "@/services/PumpService";
import { WikiService } from "@/services/WikiService";
import fastifyWebsocket from "@fastify/websocket";
import {
    CreateFastifyContextOptions,
    fastifyTRPCPlugin,
} from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import { AppRouter, createAppRouter } from "../src/createAppRouter";
import { parseEnv } from "./env";
import { JupiterService } from "@/services/JupiterService";

// @see https://fastify.dev/docs/latest/
export const server = fastify({
    maxParamLength: 5000,
    logger: true,
});

// k8s healthchecks
server.get("/healthz", (_, res) => res.code(200).send());
server.get("/readyz", (_, res) => res.code(200).send());
server.get("/", (_, res) => res.code(200).send("hello world"));

// Add cookie parser registration

const getBearerToken = (req: IncomingMessage) => {
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
};

export function createContext({ req, res }: CreateFastifyContextOptions) {
    const user = { name: req.headers.username ?? "anonymous" };
    return { req, res, user };
}

export const start = async () => {
    try {
        await server.register(import("@fastify/cookie"));
        await server.register(fastifyWebsocket);
        await server.register(import("@fastify/compress"));
        await server.register(import("@fastify/cors"), {
            origin: [
                "http://localhost:5173",
                "https://profiteer.news",
                "https://www.profiteer.news",
            ],
            credentials: true,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: [
                "Origin",
                "X-Requested-With",
                "Content-Type",
                "Accept",
                "Authorization",
                "Cookie",
                "ngrok-skip-browser-warning",
            ],
        });

        const env = parseEnv();

        const pumpService = createPumpService();
        const wikiService = WikiService();
        const authService = new AuthService();
        const jupiterService = new JupiterService();
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
                    env,
                    authService,
                    jupiterService,
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
