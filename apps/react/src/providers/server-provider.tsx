import React, { createContext, useMemo } from "react";

import { createClient as createServerClient } from "server";

export type ServerContextType = ReturnType<typeof createServerClient>;

export const ServerContext = createContext<ServerContextType | null>(null);

const httpUrl = "http://localhost:8888/trpc";
// const wsUrl = "ws://localhost:8888/trpc";

export const ServerProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const server = useMemo(() => {
        return createServerClient({
            httpUrl,
            httpHeaders: () => {
                return {
                    Authorization: `Bearer xxx`,
                };
            },
        });
    }, []);

    return (
        <ServerContext.Provider value={server}>
            {children}
        </ServerContext.Provider>
    );
};
