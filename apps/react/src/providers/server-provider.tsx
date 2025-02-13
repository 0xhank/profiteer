import { usePrivy } from "@privy-io/react-auth";
import React, { createContext, useMemo } from "react";

import { createClient as createServerClient } from "server";

export type ServerContextType = ReturnType<typeof createServerClient>;

export const ServerContext = createContext<ServerContextType | null>(null);

const httpUrl = import.meta.env.VITE_SERVER_URL + "/trpc";
// const wsUrl = "ws://localhost:8888/trpc";

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { getAccessToken, authenticated, user } = usePrivy();

    const server = useMemo(() => {
        return createServerClient({
            httpUrl,
            httpHeaders: async () => {
                const accessToken = await getAccessToken();
                console.log({ accessToken });
                return {
                    // Don't need to manually set cookies - browser handles this
                    // Other headers can still be included as needed
                    Authorization: `Bearer ${accessToken}`,
                };
            },
        });
    }, [getAccessToken, user?.id, authenticated]);

    return (
        <ServerContext.Provider value={server}>
            {children}
        </ServerContext.Provider>
    );
};
