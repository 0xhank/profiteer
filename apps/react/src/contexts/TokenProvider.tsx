"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useState,
    useEffect,
} from "react";
import { Token } from "shared/src/types/token";
import supabase from "../sbClient";
import { Database } from "../../../../database.types";

type DbToken = Database["public"]["Tables"]["token_metadata"]["Row"];
interface TokenListContextType {
    tokens: Record<string, Token>;
    isReady: boolean;
    error: Error | null;
    refreshTokens: () => void;
    getTokenByMint: (mint: string) => Promise<Token | null>;
}

export const TokenListContext = createContext<TokenListContextType | undefined>(
    undefined
);

export function TokenProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState<Record<string, Token>>({});
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchAllTokens = useCallback(async () => {
        try {
            // Set users immediately
            const { data, error } = await supabase
                .from("token_metadata")
                .select("*");
            console.log("tokensData", data);
            if (error) {
                throw new Error(error?.message);
            }
            if (!data) {
                throw new Error("No data");
            }
            const formattedTokens = data.map(formatToken);
            const newTokens = formattedTokens.reduce((acc, token) => {
                acc[token.mint] = token;
                return acc;
            }, {} as Record<string, Token>);
            setTokens(newTokens);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError(error as Error);
        } finally {
            setIsReady(true);
        }
    }, []);

    useEffect(() => {
        fetchAllTokens();
        const intervalId = setInterval(fetchAllTokens, 30000);

        return () => clearInterval(intervalId);
    }, [fetchAllTokens]);

    const refreshTokens = () => {
        if (!isReady) return;
        fetchAllTokens();
    };

    const waitUntilReady = async () => {
        let attempt = 0;
        while (!isReady) {
            console.log("waiting for tokens to be ready");
            await new Promise(resolve => setTimeout(resolve, 100));
            attempt++;
            if (attempt > 20) {
                throw new Error("Failed to fetch tokens");
            }
        }
    };

    const getTokenByMint = useCallback(async (mint: string) => {
        await waitUntilReady();
        const token = tokens[mint];
        if (token) return token;
        

        const { data, error } = await supabase
            .from("token_metadata")
            .select("*")
            .eq("mint", mint);

        if (error) throw new Error(error?.message);
        if (!data) throw new Error("No data");

        const fetchedToken = data[0] ?? null;
        if (!fetchedToken) {
            throw new Error("No token found");
        }
        const newToken = formatToken(fetchedToken);
        tokens[newToken.mint] = newToken;

        return newToken;
    }, []);

    const formatToken = (token: DbToken) : Token => {
        return {
            ...token,
            createdAt: token.created_at,
            imageUri: token.uri,
            priceUsd: 0,
        };
    };
    return (
        <TokenListContext.Provider
            value={{ tokens, isReady, refreshTokens, error, getTokenByMint }}
        >
            {children}
        </TokenListContext.Provider>
    );
}
