import { usePrivy } from "@privy-io/react-auth";
import React, { createContext, useEffect, useMemo, useState } from "react";

import { createClient as createServerClient } from "server";

export type ServerContextType = ReturnType<typeof createServerClient>;

export const ServerContext = createContext<ServerContextType | null>(null);

const httpUrl = import.meta.env.VITE_SERVER_URL + "/trpc";
// const wsUrl = "ws://localhost:8888/trpc";

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { getAccessToken } = usePrivy();
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        getAccessToken().then((token) => {
            setAccessToken(token);
        });
    }, [getAccessToken]);

    const server = useMemo(() => {
        return createServerClient({
            httpUrl,
            httpHeaders: () => {
                return {
                    // Don't need to manually set cookies - browser handles this
                    // Other headers can still be included as needed
                    Authorization: `Bearer ${accessToken}`,
                };
            },
        });
    }, [accessToken]);

    return (
        <ServerContext.Provider value={server}>
            {children}
        </ServerContext.Provider>
    );
};
