import {
    createTRPCProxyClient,
    CreateTRPCProxyClient,
    httpBatchLink,
    HTTPBatchLinkOptions,
} from "@trpc/client";

import type { AppRouter } from "./createAppRouter";

type CreateClientOptions = {
    httpUrl: string;
    httpHeaders: HTTPBatchLinkOptions["headers"];
};

/**
 * Creates a tRPC client to talk to a server.
 *
 * @param {CreateClientOptions} options See `CreateClientOptions`.
 * @returns {CreateTRPCProxyClient<AppRouter>} A typed tRPC client.
 */
export function createClient({
    httpUrl,
}: CreateClientOptions): CreateTRPCProxyClient<AppRouter> {
    return createTRPCProxyClient<AppRouter>({
        links: [
            httpBatchLink({
                url: httpUrl,
                fetch(url, options) {
                    return fetch(url, {
                        ...options,
                        credentials: "include",
                    });
                },
            }),
        ],
    });
}
