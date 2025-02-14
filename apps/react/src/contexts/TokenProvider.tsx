import { Mutex } from "async-mutex";
import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { toast } from "react-toastify";
import { Token } from "shared/src/types/token";
import supabase from "../sbClient";
import { formatToken } from "../utils/formatToken";

interface TokenListContextType {
    tokens: Record<string, Token>;
    isReady: boolean;
    refreshTokens: (mints: string[]) => Promise<void>;
    getTokenByMint: (mint: string) => Promise<Token | null>;
}

export const TokenListContext = createContext<TokenListContextType | undefined>(
    undefined
);

export function TokenProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState<Record<string, Token>>({});
    const [isReady, setIsReady] = useState(false);
    const mutex = useRef(new Mutex());
    const latestTokens = useRef(tokens);

    // initialize the tokens
    // initialize the tokens
    useEffect(() => {
        const fetchTopMintsByVolume = async () => {
            const { data, error } = await supabase
                .from("trade_volume_12h")
                .select("mint, total_volume")
                .order("total_volume", { ascending: false })
                .limit(20);

            if (error) throw new Error(error?.message);
            if (!data) throw new Error("No data");

            await refreshTokens(data.map(({ mint }) => mint));
            setIsReady(true);
        };
        fetchTopMintsByVolume();
    }, []);

    const refreshTokens = useCallback(
        async (mints: string[]) => {
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

                const newTokens = {
                    ...latestTokens.current,
                    ...formattedTokens,
                };

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
                console.log({newTokens});
                setTokens(newTokens);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                mutex.current.release();
                setIsReady(true);
            }
        },
        [tokens]
    );

    const getTokenByMint = useCallback(
        async (mint: string) => {
            const waitUntilReady = async () => {
                let attempt = 0;
                while (!isReady) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    attempt++;
                    if (attempt > 20) {
                        throw new Error("Failed to fetch newscoins");
                    }
                }
            };

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
                throw new Error("No newscoin found");
            }
            const newToken = formatToken(fetchedToken);
            tokens[newToken.mint] = newToken;

            return newToken;
        },
        [tokens, isReady]
    );

    return (
        <TokenListContext.Provider
            value={{
                tokens,
                isReady,
                refreshTokens,
                getTokenByMint,
            }}
        >
            {children}
        </TokenListContext.Provider>
    );
}
