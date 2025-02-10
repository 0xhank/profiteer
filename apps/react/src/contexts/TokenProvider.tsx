import { RealtimeChannel } from "@supabase/supabase-js";
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
    refreshTokens: () => void;
    getTokenByMint: (mint: string) => Promise<Token | null>;
}

export const TokenListContext = createContext<TokenListContextType | undefined>(
    undefined
);

export function TokenProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState<Record<string, Token>>({});
    const [isReady, setIsReady] = useState(false);

    const sub = useRef<RealtimeChannel | null>(null);

    // initialize the tokens
    useEffect(() => {
        fetchAllTokens();
        subscribeToTokenPrices();
        return () => {
            if (sub.current) {
                supabase.removeChannel(sub.current);
                sub.current = null;
            }
        };
    }, []);

    // fetch tokens
    const fetchAllTokens = useCallback(async () => {
        try {
            // Set users immediately
            const { data: metadata, error: metadataError } = await supabase
                .from("token_metadata")
                .select("*");
            if (metadataError) {
                toast.error("Error fetching tokens");
                throw new Error(metadataError?.message);
            }
            if (!metadata) {
                throw new Error("No data");
            }
            const formattedTokens = metadata.map(formatToken);
            const newTokens = formattedTokens.reduce((acc, token) => {
                acc[token.mint] = token;
                return acc;
            }, {} as Record<string, Token>);

            const { data: volumeData } = await supabase.from(
                "trade_volume_12h"
            ).select("mint, total_volume").in("mint", Object.keys(newTokens));
            
            // Update tokens with volume data
            volumeData?.forEach(({ mint, total_volume }) => {
                if (newTokens[mint]) {
                    newTokens[mint].volume12h = total_volume;
                }
            });

            setTokens(newTokens);

            // Fetch the most recent price for the token
            const { data: priceData, error: priceError } = await supabase.rpc(
                "get_latest_prices"
            );

            if (priceError) throw new Error(priceError?.message);

            priceData?.forEach((price) => {
                const tokens = newTokens;
                if (!tokens[price.mint]) return;
                tokens[price.mint].priceUsd = price.price_usd;
                setTokens(tokens);
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsReady(true);
        }
        return () => {
            if (sub.current) {
                supabase.removeChannel(sub.current);
                sub.current = null;
            }
        };
    }, []);

    const refreshTokens = () => {
        if (!isReady) return;
        fetchAllTokens();
    };

    const subscribeToTokenPrices = useCallback(async () => {
        if (sub.current) {
            supabase.removeChannel(sub.current);
            sub.current = null;
        }

        sub.current = supabase
            .channel("token_price_usd")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "token_price_usd" },
                (payload: { new: { mint: string; price_usd: number } }) => {
                    console.log("token_price_usd", payload);
                    const newTokens = tokens;
                    if (!newTokens[payload.new.mint]) return;
                    newTokens[payload.new.mint].priceUsd =
                        payload.new.price_usd;
                    setTokens(newTokens);
                }
            )
            .subscribe();
    }, [tokens]);

    const getTokenByMint = useCallback(
        async (mint: string) => {
            const waitUntilReady = async () => {
                let attempt = 0;
                while (!isReady) {
                    console.log("waiting for tokens to be ready");
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    attempt++;
                    if (attempt > 20) {
                        throw new Error("Failed to fetch tokens");
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
                throw new Error("No token found");
            }
            const newToken = formatToken(fetchedToken);
            tokens[newToken.mint] = newToken;

            return newToken;
        },
        [tokens, isReady]
    );

    return (
        <TokenListContext.Provider
            value={{ tokens, isReady, refreshTokens, getTokenByMint }}
        >
            {children}
        </TokenListContext.Provider>
    );
}
