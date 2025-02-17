import { Mutex } from "async-mutex";
import { createContext, ReactNode, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Token } from "shared/src/types/token";
import supabase from "../sbClient";
import { formatToken } from "../utils/formatToken";

interface TokenListContextType {
    tokens: Record<string, Token>;
    refreshTokens: (
        mints: string[],
        onlyMetadata?: boolean
    ) => Promise<Record<string, Token> | null>;
    getTokenByMint: (mint: string) => Promise<Token | null>;
}

export const TokenListContext = createContext<TokenListContextType | undefined>(
    undefined
);

export function TokenProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState<Record<string, Token>>({});
    // this useRef is necessary to handle race conditions for the content of the tokens object when using a mutex
    const latestTokens = useRef(tokens);

    const mutex = useRef(new Mutex());

    const refreshTokens = useCallback(
        async (mints: string[], onlyMetadata: boolean = false) => {
            let newTokens: Record<string, Token> = {};
            try {
                await mutex.current.waitForUnlock();
                await mutex.current.acquire();
                const cachedTokens = Object.keys(latestTokens.current);
                const tokensToFetch = mints.filter(
                    (mint) => !cachedTokens.includes(mint)
                );
                // Set users immediately
                const { data: metadata, error: metadataError } = await supabase
                    .from("token_metadata")
                    .select("*")
                    .in("mint", tokensToFetch);

                if (metadataError) {
                    toast.error("Error fetching tokens");
                    throw new Error(metadataError?.message);
                }
                if (!metadata) {
                    throw new Error("No data");
                }
                const formattedTokens = metadata.reduce((acc, token) => {
                    acc[token.mint] = formatToken(token);
                    return acc;
                }, {} as Record<string, Token>);

                newTokens = {
                    ...latestTokens.current,
                    ...formattedTokens,
                };

                if (onlyMetadata) {
                    setTokens(newTokens);
                    return newTokens;
                }
                const [volumeResponse, priceResponse, priceHistoryResponse] =
                    await Promise.all([
                        supabase
                            .from("trade_volume_12h")
                            .select("mint, total_volume")
                            .in("mint", mints),
                        supabase.rpc("get_token_prices", {
                            mint_array: tokensToFetch,
                        }),
                        supabase.rpc("get_price_changes", {
                            target_mints: tokensToFetch,
                        }),
                    ]);
                const { data: priceData, error: priceError } = priceResponse;

                if (priceError) throw new Error(priceError?.message);

                const { data: volumeData } = volumeResponse;
                const { data: priceHistoryData } = priceHistoryResponse;

                // Update tokens with volume and price data
                priceHistoryData?.forEach((price) => {
                    if (newTokens[price.mint]) {
                        newTokens[price.mint].pastPrices = {
                            price1h: price.price_1h,
                            price1d: price.price_24h,
                            price30d: price.price_30d,
                        };
                    }
                });
                volumeData?.forEach(({ mint, total_volume }) => {
                    if (newTokens[mint]) {
                        newTokens[mint].volume12h = total_volume;
                    }
                });

                priceData?.forEach((price) => {
                    if (newTokens[price.mint]) {
                        newTokens[price.mint].priceUsd = price.price_usd;
                    }
                });

                latestTokens.current = newTokens;
                setTokens(newTokens);
                return newTokens;
            } catch (error) {
                console.error("Error fetching data:", error);
                return null
            } finally {
                mutex.current.release();
            }
        },
        [tokens]
    );

    const getTokenByMint = useCallback(
        async (mint: string) => {
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
                throw new Error("No newscoin found");
            }
            const newToken = formatToken(fetchedToken);
            tokens[newToken.mint] = newToken;

            return newToken;
        },
        [tokens]
    );

    return (
        <TokenListContext.Provider
            value={{
                tokens,
                refreshTokens,
                getTokenByMint,
            }}
        >
            {children}
        </TokenListContext.Provider>
    );
}
